export type Project = {
  title: string
  location: string
  date: string
  link: string
  id: string
}

export type DbProject = Project & { seenTimestamp: string }
