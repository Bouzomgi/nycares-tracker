import { Project, getProjects } from './getProjects'
import sendEmail from './sendEmail'
import {
  DbProject,
  addProject,
  getSeenProjects,
  updateProjectTimestamp,
} from './databaseOps'
import unwantedProjects from './unwantedProjects'
import dayjs from 'dayjs'
import { Handler } from 'aws-lambda'

const NYCARESAPIURL =
  'https://www.newyorkcares.org/api/search/1/?boroughs%5B%5D=Manhattan&days%5B%5D=Sunday&html=true&variant=full'

// If any projects have been seen within the last day, ignore them.
// Otherwise, update the seenTimestamp
const updateSeenProjects = (seenProjects: DbProject[]): Project[] => {
  const currentDay = dayjs()

  const updatedProjects: Project[] = seenProjects.flatMap((project) => {
    const projectDay = dayjs(project.seenTimestamp)
    const diffInMinutes = Math.abs(projectDay.diff(currentDay, 'minute'))

    // 23 hours and 57 minutes
    if (diffInMinutes >= 23 * 60 + 57) {
      updateProjectTimestamp(project).catch((error) => {
        console.log(`Error with updating seenTimestamp -- ${error}`)
      })
      return [project as Project]
    }
    return []
  })

  console.log(`updatedProjects: ${updatedProjects}`)

  return updatedProjects
}

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

    // sendEmail('New NYCares Opportunity!', message)
  }
}

main().catch((error) => console.log(error))

export const handler: Handler = async (event: any, context: any) => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2))
  await main().catch((error) => console.log(error))
  return context.logStreamName
}
