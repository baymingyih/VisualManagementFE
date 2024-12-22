export interface IAction {
    id: number
    title: string
    description: string | null
    deadlineDateTime: string
    status: number
    priority: number
    escalatedto_team: null | {
        id: number
        name: string
    }
    escalatedfrom_team: null | {
        id: number
        name: string
    }
    userId: number
    PIC_firstName: string
    PIC_lastName: string
    avatar_color: string
    key: React.key
    project_action_list: Array<{projectId: number, projectTitle: string}>
}