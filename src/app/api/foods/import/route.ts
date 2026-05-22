import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const data = await req.json()

  try {
    // Check for duplicate based on externalId or barcode
    if (data.externalId || data.barcode) {
      const existing = await prisma.foodItem.findFirst({
        where: {
          OR: [
            { externalId: data.externalId },
            { barcode: data.barcode }
          ],
          user_id: user.id
        }
      })

      if (existing) {
        return NextResponse.json({ data: existing })
      }
    }

    // Create new personal item
    const newItem = await prisma.foodItem.create({
      data: {
        user_id: user.id,
        name: data.name,
        brand: data.brand,
        source: data.source || 'Open Food Facts',
        externalId: data.externalId,
        barcode: data.barcode,
        category: data.category,
        image_url: data.image_url,
        
        baseAmount: data.baseAmount || 100,
        baseUnit: data.baseUnit || 'GRAM',
        gramsPerUnit: data.gramsPerUnit,
        servingSize: data.servingSize,
        servingUnit: data.servingUnit,

        proteinPer100g: data.proteinPer100g,
        carbsPer100g: data.carbsPer100g,
        fatPer100g: data.fatPer100g,
        caloriesPer100g: data.caloriesPer100g,
      }
    })

    return NextResponse.json({ data: newItem })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json({ error: 'Import failed' }, { status: 500 })
  }
}
