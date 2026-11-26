import {
    CreateInternalSquadCommand as OfficialCreateInternalSquadCommand,
    GetInternalSquadCommand as OfficialGetInternalSquadCommand,
    GetInternalSquadsCommand as OfficialGetInternalSquadsCommand,
    UpdateInternalSquadCommand as OfficialUpdateInternalSquadCommand,
} from '@remnawave/backend-contract'
import { z } from 'zod'

const includeQwdttRequest = {
    includeQwdtt: z.boolean().optional(),
}

const includeQwdttResponse = {
    includeQwdtt: z.boolean().default(false),
}

export const CreateInternalSquadRequestBodySchema =
    OfficialCreateInternalSquadCommand.RequestBodySchema.extend(includeQwdttRequest)

export const UpdateInternalSquadRequestBodySchema =
    OfficialUpdateInternalSquadCommand.RequestBodySchema.extend(includeQwdttRequest)

export const InternalSquadResponseItemSchema =
    OfficialGetInternalSquadCommand.ResponseSchema.shape.response.extend(includeQwdttResponse)

export const GetInternalSquadResponseSchema = OfficialGetInternalSquadCommand.ResponseSchema.extend(
    {
        response: InternalSquadResponseItemSchema,
    }
)

export const GetInternalSquadsResponseSchema =
    OfficialGetInternalSquadsCommand.ResponseSchema.extend({
        response: OfficialGetInternalSquadsCommand.ResponseSchema.shape.response.extend({
            internalSquads: z.array(InternalSquadResponseItemSchema),
        }),
    })

export const CreateInternalSquadResponseSchema = OfficialCreateInternalSquadCommand.ResponseSchema.extend(
    {
        response: InternalSquadResponseItemSchema,
    }
)

export const UpdateInternalSquadResponseSchema = OfficialUpdateInternalSquadCommand.ResponseSchema.extend(
    {
        response: InternalSquadResponseItemSchema,
    }
)

export type CreateInternalSquadRequestBody = z.infer<typeof CreateInternalSquadRequestBodySchema>
export type UpdateInternalSquadRequestBody = z.infer<typeof UpdateInternalSquadRequestBodySchema>
export type InternalSquadResponseItem = z.infer<typeof InternalSquadResponseItemSchema>
