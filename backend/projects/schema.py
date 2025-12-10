import graphene
from graphene_django import DjangoObjectType

from .models import Organization, Project, Task, TaskComment


# --------------------
# GraphQL Types
# --------------------


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
            "tasks",
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
            "comments",
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


# --------------------
# Helper: get org from request (with safe fallback for dev)
# --------------------


def get_request_org(request):
    """
    Multi-tenancy helper:
    - Prefer X-ORG-SLUG header
    - Fallback to first organization in dev so GraphiQL still works
    """
    org_slug = request.META.get("HTTP_X_ORG_SLUG")

    if org_slug:
        try:
            return Organization.objects.get(slug=org_slug)
        except Organization.DoesNotExist:
            raise Exception("Invalid organization slug.")
    else:
        # DEV fallback – okay for assignment, but in real prod you'd enforce header.
        org = Organization.objects.first()
        if not org:
            raise Exception("No organizations exist yet.")
        return org


# --------------------
# Queries
# --------------------


class Query(graphene.ObjectType):
    # Projects
    projects = graphene.List(
        ProjectType,
        status=graphene.Argument(graphene.String, required=False),
    )
    project = graphene.Field(
        ProjectType,
        id=graphene.ID(required=True),
    )

    # Tasks
    tasks = graphene.List(
        TaskType,
        project_id=graphene.Argument(graphene.ID, required=False),
        status=graphene.Argument(graphene.String, required=False),
    )
    task = graphene.Field(
        TaskType,
        id=graphene.ID(required=True),
    )

    # ----- Project resolvers -----

    def resolve_projects(self, info, status=None):
        request = info.context
        org = get_request_org(request)

        qs = Project.objects.select_related("organization").filter(
            organization=org
        )

        if status:
            qs = qs.filter(status=status)

        return qs

    def resolve_project(self, info, id):
        request = info.context
        org = get_request_org(request)

        return Project.objects.select_related("organization").get(
            pk=id,
            organization=org,
        )

    # ----- Task resolvers -----

    def resolve_tasks(self, info, project_id=None, status=None):
        request = info.context
        org = get_request_org(request)

        qs = Task.objects.select_related("project", "project__organization").filter(
            project__organization=org
        )

        if project_id:
            qs = qs.filter(project_id=project_id)

        if status:
            qs = qs.filter(status=status)

        return qs

    def resolve_task(self, info, id):
        request = info.context
        org = get_request_org(request)

        return Task.objects.select_related("project", "project__organization").get(
            pk=id,
            project__organization=org,
        )


# --------------------
# Mutations
# --------------------


class CreateProject(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        description = graphene.String(required=False)
        status = graphene.String(required=False)
        due_date = graphene.Date(required=False)

    project = graphene.Field(ProjectType)

    @staticmethod
    def mutate(root, info, name, description=None, status=None, due_date=None):
        request = info.context
        org = get_request_org(request)

        project = Project.objects.create(
            organization=org,
            name=name,
            description=description or "",
            status=status or Project.Status.ACTIVE,
            due_date=due_date,
        )
        return CreateProject(project=project)


class CreateTask(graphene.Mutation):
    class Arguments:
        project_id = graphene.ID(required=True)
        title = graphene.String(required=True)
        description = graphene.String(required=False)
        status = graphene.String(required=False)
        assignee_email = graphene.String(required=True)
        due_date = graphene.Date(required=False)

    task = graphene.Field(TaskType)

    @staticmethod
    def mutate(
        root,
        info,
        project_id,
        title,
        assignee_email,
        description=None,
        status=None,
        due_date=None,
    ):
        request = info.context
        org = get_request_org(request)

        try:
            project = Project.objects.get(pk=project_id, organization=org)
        except Project.DoesNotExist:
            raise Exception("Project not found in this organization.")

        task = Task.objects.create(
            project=project,
            title=title,
            description=description or "",
            status=status or Task.Status.TODO,
            assignee_email=assignee_email,
            due_date=due_date,
        )
        return CreateTask(task=task)


class UpdateTaskStatus(graphene.Mutation):
    class Arguments:
        task_id = graphene.ID(required=True)
        status = graphene.String(required=True)

    task = graphene.Field(TaskType)

    @staticmethod
    def mutate(root, info, task_id, status):
        request = info.context
        org = get_request_org(request)

        try:
            task = Task.objects.select_related("project", "project__organization").get(
                pk=task_id,
                project__organization=org,
            )
        except Task.DoesNotExist:
            raise Exception("Task not found in this organization.")

        # Optional: validate allowed statuses
        valid_statuses = {choice[0] for choice in Task.Status.choices}
        if status not in valid_statuses:
            raise Exception(f"Invalid status. Allowed: {', '.join(valid_statuses)}")

        task.status = status
        task.save()
        return UpdateTaskStatus(task=task)


class AddTaskComment(graphene.Mutation):
    class Arguments:
        task_id = graphene.ID(required=True)
        content = graphene.String(required=True)
        author_email = graphene.String(required=True)

    comment = graphene.Field(TaskCommentType)

    @staticmethod
    def mutate(root, info, task_id, content, author_email):
        request = info.context
        org = get_request_org(request)

        try:
            task = Task.objects.select_related("project", "project__organization").get(
                pk=task_id,
                project__organization=org,
            )
        except Task.DoesNotExist:
            raise Exception("Task not found in this organization.")

        comment = TaskComment.objects.create(
            task=task,
            content=content,
            author_email=author_email,
        )
        return AddTaskComment(comment=comment)


class Mutation(graphene.ObjectType):
    create_project = CreateProject.Field()
    create_task = CreateTask.Field()
    update_task_status = UpdateTaskStatus.Field()
    add_task_comment = AddTaskComment.Field()
