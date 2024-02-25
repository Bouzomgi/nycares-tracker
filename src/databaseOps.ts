import env from './config'
import {
  DynamoDBClient,
  ResourceNotFoundException,
} from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  BatchGetCommand,
  PutCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb'
import { Project, DbProject } from './models/Project'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

// Get all seen projects from Dynamo Table
export const getSeenProjects = async (
  projects: Project[]
): Promise<DbProject[]> => {
  const projectKeys = projects.map((project) => {
    return {
      projectId: project.id,
    }
  })

  const command = new BatchGetCommand({
    RequestItems: {
      [env.DATABASE_TABLE_NAME]: {
        Keys: projectKeys,
      },
    },
  })

  try {
    const result = await docClient.send(command)
    const projectRecords = result.Responses![env.DATABASE_TABLE_NAME]

    const projects = projectRecords.map((projectRecord) => {
      return {
        title: projectRecord['title'],
        date: projectRecord['date'],
        link: projectRecord['link'],
        location: projectRecord['location'],
        id: projectRecord['projectId'],
        seenTimestamp: projectRecord['seenTimestamp'],
      }
    })
    return projects
  } catch (error) {
    if (error instanceof ResourceNotFoundException) {
      return []
    } else {
      throw error
    }
  }
}

// Add a new project to Dynamo
export const addProject = async (project: Project) => {
  const command = new PutCommand({
    TableName: env.DATABASE_TABLE_NAME,
    Item: {
      title: project.title,
      date: project.date,
      link: project.link,
      location: project.location,
      projectId: project.id,
      seenTimestamp: new Date().toString(),
    },
  })

  const response = await docClient.send(command)
  console.log(response)
  return response
}

// Update dynamo to update seenTimestamp for a given project
export const updateProjectTimestamp = async (project: Project) => {
  const command = new UpdateCommand({
    TableName: env.DATABASE_TABLE_NAME,
    Key: {
      projectId: project.id,
    },
    UpdateExpression: 'SET #ts = :ts',
    ExpressionAttributeNames: {
      '#ts': 'seenTimestamp',
    },
    ExpressionAttributeValues: {
      ':ts': new Date().toString(),
    },
  })

  const response = await docClient.send(command)
  console.log(response)
  return response
}
