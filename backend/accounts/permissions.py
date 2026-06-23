from rest_framework.permissions import BasePermission


class IsTeacher(BasePermission):
    message = "Only tutors can manage courses."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == "teacher"
        )


class IsStudent(BasePermission):
    message = "Only students can view learner course catalogs."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == "student"
        )
