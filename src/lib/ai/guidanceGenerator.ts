import OpenAI from 'openai'
import { BODY_COCKPIT_SYSTEM_PROMPT } from './prompts'
import { BiometricLog } from '@prisma/client'

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY_MISSING')
  }
  return new OpenAI({ apiKey })
}

export interface AIMissionBriefing {
  status: 'OPTIMAL' | 'STABLE' | 'ELEVATED' | 'HIGH' | 'CRITICAL'
  mission_briefing: string
  priority_action: string
  recovery_analysis: string
  nutrition_analysis: string
  training_analysis: string
  pilot_status: string
}

export async function generateAIGuidance(
  biometrics: BiometricLog[],
  nutrition: { protein: number, carbs: number, fat: number, calories: number, goal: number },
  recentWorkouts: { intensity: number; logged_at: Date }[]
): Promise<AIMissionBriefing | null> {
  try {
    const openai = getOpenAI()
    const dataContext = {
      telemetry: biometrics.map(b => ({ type: b.type, value: b.value, timestamp: b.logged_at })),
      nutrition: {
        consumed: { p: nutrition.protein, c: nutrition.carbs, f: nutrition.fat, total_kcal: nutrition.calories },
        targets: { protein_goal: nutrition.goal }
      },
      mission_history: recentWorkouts.map(w => ({ intensity: w.intensity, date: w.logged_at }))
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: BODY_COCKPIT_SYSTEM_PROMPT },
        { role: "user", content: `CURRENT_DATA_STREAM: ${JSON.stringify(dataContext)}` }
      ],
      response_format: { type: "json_object" }
    })

    const content = response.choices[0].message.content
    if (!content) return null

    return JSON.parse(content) as AIMissionBriefing
  } catch (error) {
    if (error instanceof Error && error.message === 'OPENAI_API_KEY_MISSING') {
      console.warn('BODY_COCKPIT_OS: Skipping AI guidance - API key missing (likely build time).')
      return null
    }
    console.error('BODY_COCKPIT_OS: AI Guidance failure.', error)
    return null
  }
}
