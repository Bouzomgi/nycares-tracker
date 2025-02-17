import crypto from 'crypto'
import dayjs from 'dayjs'
import { Project } from './models/Project'

const NYCARESAPIURL =
  'https://www.newyorkcares.org/api/search/?boroughs%5B%5D=Manhattan&days%5B%5D=Saturday&days%5B%5D=Sunday&variant=full'
const NYCARESURL = 'https://www.newyorkcares.org'

function hashString(input: string) {
  const hash = crypto.createHash('sha256')
  hash.update(input)
  return hash.digest('hex')
}

// Input will be [start, stop]
const formatStartStop = (startStop: dayjs.Dayjs[]) => {
  if (startStop[0].format('A') !== startStop[1].format('A')) {
    return `${startStop[0].format('ddd MMM D (h:mm A')} - ${startStop[1].format('h:mm A)')}`
  } else {
    return `${startStop[0].format('ddd MMM D (h:mm')} - ${startStop[1].format('h:mm A)')}`
  }
}

// Query nyCares URL to get all projects
export const getProjects = async (): Promise<Project[]> => {
  const res = await fetch(NYCARESAPIURL)
  const rb = await res.json()

  const projects = rb[0]['data']
  const openProjects = projects.filter(
    (projectJson: any) => projectJson['Full_Capacity_Boolean__c'] == false
  )

  const simplifiedProjects = openProjects.map((projectJson: any) => {
    const startStop = [
      projectJson['Activity_Start_Time__c'],
      projectJson['Activity_End_Time__c'],
    ].map((time) => dayjs(`${projectJson['StartDate']} ${time}`))

    const date = formatStartStop(startStop)

    const title = projectJson['Web_Title_FF__c']
    const projectHash = hashString(title + date)
    const link = `${NYCARESURL}/project/${projectJson['Id']}`

    return {
      title: title,
      location: projectJson['SiteLocation__tl'],
      date: date,
      link: link,
      id: projectHash,
    }
  })

  return simplifiedProjects
}
