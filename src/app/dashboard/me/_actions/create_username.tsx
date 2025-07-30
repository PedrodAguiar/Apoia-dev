"use server"
import { auth } from "@/lib/auth"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { createSlug } from "@/utils/create-slug"


const creatUsernameSchema = z.object({
    username: z.string({ message: "o username é obrigatório" }).min(4, "o username deve ter no minimo 4 caracteres")
})
type CreatUsernameFormData = z.infer<typeof creatUsernameSchema>

export async function creatUsername(data: CreatUsernameFormData) {

    const session = await auth()

    if (!session?.user) {
        return {
            data: null,
            error: "Usuário não autentificado"
        }
    }

    const schema = creatUsernameSchema.safeParse(data)

    if (!schema.success) {
        console.log(schema)
        return {
            data: null,
            error: schema.error.issues[0].message
        }
    }

    try {
        const userId = session.user.id

        const slug = createSlug(data.username);

        const existSlug = await prisma.user.findFirst({
            where: {
                username: slug
            }
        })

        if (existSlug) {
            return {
                data: null,
                error: "username existente"
            }
        }
        await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                username: slug
            }

        })
        return {
            data: slug,
            error: null
        }
    }

    catch (err) {
        return {
            data: null,
            error: "Falha ao atualizar o username"
        }
    }
}