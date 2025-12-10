# GraphQL types: OrganizationType, ProjectType, TaskType, TaskCommentType

import graphene
from graphene_django import DjangoObjectType

from .models import Organization, Project, Task, TaskComment


class OrganizationType(DjangoObjectType):
    class Meta:
        model = Organization
        fields = ("id", "name", "slug", "contact_email", "created_at")


class ProjectType(DjangoObjectType):
    # extra computed fields
    task_count = graphene.Int()
    completed_tasks = graphene.Int()

    class Meta:
        model = Project
        fields = (
            "id",
            "name",
            "description",
            "status",
            "due_date",
            "created_at",
            "organization",
        )

    def resolve_task_count(self, info):
        return self.tasks.count()

    def resolve_completed_tasks(self, info):
        return self.tasks.filter(status=Task.Status.DONE).count()


class TaskType(DjangoObjectType):
    class Meta:
        model = Task
        fields = (
            "id",
            "title",
            "description",
            "status",
            "assignee_email",
            "due_date",
            "created_at",
            "project",
        )


class TaskCommentType(DjangoObjectType):
    class Meta:
        model = TaskComment
        fields = (
            "id",
            "content",
            "author_email",
            "created_at",
            "task",
        )

class Query(graphene.ObjectType):
    # list all projects for the current org (we'll refine multi-tenancy later)
    projects = graphene.List(
        ProjectType,
        status=graphene.Argument(graphene.String, required=False),
    )

    project = graphene.Field(
        ProjectType,
        id=graphene.ID(required=True),
    )

    def resolve_projects(self, info, status=None):
        qs = Project.objects.select_related("organization").all()

        # basic org filter using header (we'll enforce more strictly later)
        request = info.context
        org_slug = request.META.get("HTTP_X_ORG_SLUG")
        if org_slug:
            qs = qs.filter(organization__slug=org_slug)

        if status:
            qs = qs.filter(status=status)

        return qs

    def resolve_project(self, info, id):
        qs = Project.objects.select_related("organization").all()

        request = info.context
        org_slug = request.META.get("HTTP_X_ORG_SLUG")
        if org_slug:
            qs = qs.filter(organization__slug=org_slug)

        return qs.get(pk=id)


class CreateProject(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        description = graphene.String(required=False)
        status = graphene.String(required=False)
        due_date = graphene.types.datetime.Date(required=False)

    project = graphene.Field(ProjectType)

    @staticmethod
    def mutate(root, info, name, description=None, status=None, due_date=None):
        request = info.context
        org_slug = request.META.get("HTTP_X_ORG_SLUG")

        if not org_slug:
            raise Exception("Organization context missing (X-ORG-SLUG header).")

        try:
            organization = Organization.objects.get(slug=org_slug)
        except Organization.DoesNotExist:
            raise Exception("Invalid organization.")

        project = Project.objects.create(
            organization=organization,
            name=name,
            description=description or "",
            status=status or Project.Status.ACTIVE,
            due_date=due_date,
        )
        return CreateProject(project=project)
class Mutation(graphene.ObjectType):
    create_project = CreateProject.Field()
