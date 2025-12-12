# backend/projects/tests/test_api.py
from django.test import TestCase, Client
from django.urls import reverse
from projects.models import Organization, Project, Task
import json


GRAPHQL_URL = "/graphql/"


class GraphQLBackendTests(TestCase):
    def setUp(self):
        self.client = Client()
        # Create two organizations
        self.org1 = Organization.objects.create(
            name="Org One", slug="org-one", contact_email="a@org.one"
        )
        self.org2 = Organization.objects.create(
            name="Org Two", slug="org-two", contact_email="b@org.two"
        )

    def _post(self, query, variables=None, org_slug="org-one"):
        body = {"query": query}
        if variables is not None:
            body["variables"] = variables
        return self.client.post(
            GRAPHQL_URL,
            data=json.dumps(body),
            content_type="application/json",
            HTTP_X_ORG_SLUG=org_slug,
        )

    def test_create_project_and_list(self):
        # create a project in org1
        create_project_mutation = """
        mutation CreateProject($name: String!, $description: String) {
          createProject(name: $name, description: $description) {
            project { id name description status }
          }
        }
        """
        resp = self._post(
            create_project_mutation,
            {"name": "Test Project", "description": "desc"},
            org_slug="org-one",
        )
        data = json.loads(resp.content)
        self.assertIsNone(data.get("errors"))
        project_data = data["data"]["createProject"]["project"]
        self.assertEqual(project_data["name"], "Test Project")

        # list projects for org-one - should include created
        list_query = "{ projects { id name } }"
        resp2 = self._post(list_query, org_slug="org-one")
        data2 = json.loads(resp2.content)
        names = [p["name"] for p in data2["data"]["projects"]]
        self.assertIn("Test Project", names)

    def test_create_task_and_counts(self):
        # create project first
        p = Project.objects.create(
            organization=self.org1, name="P2", status="ACTIVE"
        )

        create_task_mutation = """
        mutation CreateTask($projectId: ID!, $title: String!, $assigneeEmail: String!) {
          createTask(projectId: $projectId, title: $title, assigneeEmail: $assigneeEmail) {
            task { id title status assigneeEmail }
          }
        }
        """
        resp = self._post(
            create_task_mutation,
            {"projectId": str(p.id), "title": "T1", "assigneeEmail": "u@x.com"},
            org_slug="org-one",
        )
        data = json.loads(resp.content)
        self.assertIsNone(data.get("errors"))
        task = data["data"]["createTask"]["task"]
        self.assertEqual(task["title"], "T1")

        # query project stats
        project_query = """
        query GetProject($id: ID!) {
          project(id: $id) {
            id taskCount completedTasks
          }
        }
        """
        resp2 = self._post(project_query, {"id": str(p.id)}, org_slug="org-one")
        data2 = json.loads(resp2.content)
        self.assertEqual(int(data2["data"]["project"]["taskCount"]), 1)
        self.assertEqual(int(data2["data"]["project"]["completedTasks"]), 0)

    def test_org_isolation(self):
        # Create project in org2 only
        Project.objects.create(organization=self.org2, name="Org2Proj", status="ACTIVE")

        # Query as org-one -> should not see org-two project
        resp = self._post("{ projects { name } }", org_slug="org-one")
        data = json.loads(resp.content)
        names = [p["name"] for p in data["data"]["projects"]]
        self.assertNotIn("Org2Proj", names)

        # Query as org-two -> should see it
        resp2 = self._post("{ projects { name } }", org_slug="org-two")
        data2 = json.loads(resp2.content)
        names2 = [p["name"] for p in data2["data"]["projects"]]
        self.assertIn("Org2Proj", names2)
