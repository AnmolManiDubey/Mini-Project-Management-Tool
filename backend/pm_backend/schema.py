#This is the root schema that Graphene uses.
import graphene
from projects.schema import Query as ProjectsQuery, Mutation as ProjectsMutation


class Query(ProjectsQuery, graphene.ObjectType):
    # You can combine multiple app queries later
    pass


class Mutation(ProjectsMutation, graphene.ObjectType):
    # Combine app mutations here
    pass


schema = graphene.Schema(query=Query, mutation=Mutation)
