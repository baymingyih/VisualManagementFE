import { PrismaClient as PrismaClientMain } from "../prisma/generated/client_main";
import { Request, Response } from "express"
const prisma = new PrismaClientMain();

export async function getOrganisationById(req: Request, res: Response) {
    try {
        const orgId = parseInt(req.params.orgId)
        const org = await prisma.organisations.findUnique({
            where: { id: orgId },
            select: {
                id: true,
                name: true,
                created_at: true
            }
        });
        res.status(200).json(org);
    } catch (error) {
        console.log('error:', error);
        res.status(500).send('Internal server error');
    }
}

export async function updateOrganisation(req: Request, res: Response) {
    try {
        const orgId = parseInt(req.params.orgId)
        const { name } : {name: string} = req.body;
        const org = await prisma.organisations.update({
            where: { id: orgId },
            data: {
                name: name
            }
        });
        res.status(200).json(org);
    } catch (error) {
        console.log('error:', error);
        res.status(500).send('Internal server error');
    }
}