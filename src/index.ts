import { Handler } from 'aws-lambda'

import { getProjects } from './getProjects'
import { Project } from './models/Project'
import { addProject, getSeenProjects } from './databaseOps'
import unwantedProjects from './unwantedProjects'
import updateSeenProjects from './updateSeenProjects'
import sendEmail from './sendEmail'

// Generate a clean email message for the projects
const generateMessage = (projects: Project[]): string => {
  const messageList = projects.map((Project) => {
    return `${Project.title} [${Project.location}] on ${Project.date}\n${Project.link}`
  })

  return messageList.join('\n\n')
}

const main = async () => {
  const allProjects = await getProjects()

  console.log(`allProjects: ${allProjects}`)

  const wantedProjects = allProjects.filter((project) => {
    return !unwantedProjects.titles.includes(project.title)
  })
  console.log(`wantedProjects: ${wantedProjects}`)

  if (wantedProjects.length == 0) return

  const seenProjects = await getSeenProjects(wantedProjects)
  console.log(`seenProjects: ${seenProjects}`)

  const updatedProjects = await updateSeenProjects(seenProjects)
  const seenProjectIds = seenProjects.map((project) => project.id)
  console.log(`seenProjectIds: ${seenProjectIds}`)

  const unseenProjects = wantedProjects.filter((project) => {
    return !seenProjectIds.includes(project.id)
  })
  console.log(`unseenProjects: ${unseenProjects}`)

  unseenProjects.forEach((project) => {
    addProject(project)
  })

  const projectsToMessage = updatedProjects.concat(unseenProjects)
  console.log(`projectsToMessage: ${projectsToMessage}`)

  if (projectsToMessage.length > 0) {
    const message = generateMessage(projectsToMessage)
    console.log(`message: ${message}`)

    sendEmail('New NYCares Opportunity!', message)
  }
}

main().catch((error) => console.log('error -- ' + error))

export const handler: Handler = async (event: any, context: any) => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2))
  await main().catch((error) => console.log(error))
  return context.logStreamName
}
