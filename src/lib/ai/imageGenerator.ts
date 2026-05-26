import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateExerciseImage(exerciseName: string, category: string) {
  try {
    const prompt = `A highly detailed, professional fitness illustration of a person performing the exercise "${exerciseName}". 
    Style: Cyber-industrial / Body Cockpit aesthetic. 
    Colors: Deep dark backgrounds, zinc-colored equipment, and vibrant neon green (#00FF41) highlights on the targeted muscle groups. 
    Composition: Anatomical focus, clean lines, high-tech interface overlays. 
    No text, no faces, focus on movement and form.`

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    })

    return response.data?.[0]?.url ?? null
  } catch (error) {
    console.error('AI Image Generation Error:', error)
    return null
  }
}
