import { Project, DbProject } from './models/Project'
import dayjs from 'dayjs'
import { updateProjectTimestamp } from './databaseOps'

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

export default updateSeenProjects
