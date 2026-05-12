import { createAsyncThunk } from "@reduxjs/toolkit"
import strapi from "@strapi"

export const getDiagnosisCode = createAsyncThunk(
	'getDiagnosisCode',
	async (): Promise<unknown> => {
		const { data } = await strapi.get('/diagnose-codes/')
		return data
	}
)