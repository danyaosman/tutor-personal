from django.contrib import admin
from .models import Course,Classroom,ClassroomEnrollment,CourseResource,Syllabus

admin.site.register(Course)
admin.site.register(Classroom)
admin.site.register(ClassroomEnrollment)
admin.site.register(CourseResource)
admin.site.register(Syllabus)

