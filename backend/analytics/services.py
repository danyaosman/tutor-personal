from collections import defaultdict

from django.contrib.auth import get_user_model

from quizzes.models import QuizAnswer, QuizAttempt

from .models import WeaknessReport

User = get_user_model()


def enrolled_students_for_course(course):
    return (
        User.objects.filter(
            role=User.STUDENT,
            classroom_enrollments__classroom__course=course,
        )
        .order_by("username")
        .distinct()
    )


def summarize_question_misses(incorrect_answers):
    grouped = defaultdict(
        lambda: {
            "miss_count": 0,
            "selected_options": set(),
            "selected_choices": {},
            "question_id": None,
            "question_text": "",
            "quiz_id": None,
            "quiz_title": "",
            "correct_option": "",
            "correct_choice": "",
            "explanation": "",
        }
    )

    for answer in incorrect_answers:
        question = answer.question
        option_text_by_key = {
            str(option.get("key", "")).strip().upper()[:1]: str(
                option.get("text", "")
            ).strip()
            for option in question.options
            if isinstance(option, dict)
        }
        selected_option = answer.selected_option.strip().upper()[:1]
        correct_option = question.correct_option.strip().upper()[:1]
        item = grouped[question.id]
        item["miss_count"] += 1
        if selected_option:
            item["selected_options"].add(selected_option)
            item["selected_choices"][selected_option] = option_text_by_key.get(
                selected_option,
                "",
            )
        item["question_id"] = question.id
        item["question_text"] = question.question_text
        item["quiz_id"] = question.quiz_id
        item["quiz_title"] = question.quiz.title
        item["correct_option"] = correct_option
        item["correct_choice"] = option_text_by_key.get(correct_option, "")
        item["explanation"] = question.explanation

    topics = []
    for item in grouped.values():
        selected_options = sorted(option for option in item["selected_options"] if option)
        selected_choices = [
            {
                "key": option,
                "text": item["selected_choices"].get(option, ""),
            }
            for option in selected_options
        ]
        topics.append(
            {
                "question_id": item["question_id"],
                "quiz_id": item["quiz_id"],
                "quiz_title": item["quiz_title"],
                "topic": item["question_text"][:120],
                "miss_count": item["miss_count"],
                "selected_options": selected_options,
                "selected_choices": selected_choices,
                "correct_option": item["correct_option"],
                "correct_choice": item["correct_choice"],
                "explanation": item["explanation"],
            }
        )

    return sorted(
        topics,
        key=lambda topic: (-topic["miss_count"], topic["topic"]),
    )


def build_weakness_report_payload(student, course):
    attempts = QuizAttempt.objects.filter(student=student, quiz__course=course)
    attempt_count = attempts.count()
    answers = QuizAnswer.objects.filter(attempt__in=attempts).select_related(
        "question",
        "question__quiz",
    )
    answer_count = answers.count()

    if attempt_count == 0:
        return {
            "weakness_summary": (
                "No quiz attempts are available yet, so no weak topics can be inferred."
            ),
            "weak_topics": [],
        }

    if answer_count == 0:
        return {
            "weakness_summary": (
                f"{student.get_full_name() or student.username} has quiz attempts, "
                "but no saved answers are available for analysis."
            ),
            "weak_topics": [],
        }

    incorrect_answers = list(answers.filter(is_correct=False))
    if not incorrect_answers:
        return {
            "weakness_summary": (
                f"No weak topics detected from {attempt_count} quiz attempt(s). "
                "All saved answers for this course are correct."
            ),
            "weak_topics": [],
        }

    weak_topics = summarize_question_misses(incorrect_answers)
    incorrect_count = len(incorrect_answers)
    accuracy = round(((answer_count - incorrect_count) / answer_count) * 100)
    return {
        "weakness_summary": (
            f"{student.get_full_name() or student.username} missed {incorrect_count} "
            f"of {answer_count} saved quiz answer(s) across {attempt_count} attempt(s). "
            f"Estimated quiz-answer accuracy is {accuracy}%."
        ),
        "weak_topics": weak_topics,
    }


def generate_weakness_report(student, course):
    payload = build_weakness_report_payload(student, course)
    WeaknessReport.objects.filter(student=student, course=course).delete()
    return WeaknessReport.objects.create(
        student=student,
        course=course,
        weakness_summary=payload["weakness_summary"],
        weak_topics=payload["weak_topics"],
    )
