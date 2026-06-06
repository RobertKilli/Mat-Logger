import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { biometrics } = await request.json();

    if (!Array.isArray(biometrics)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    // Batch upsert biometric records
    // In a real scenario, we would use a more efficient upsert logic
    // for simplicity here, we create new records (the BiometricLog model doesn't have unique constraint on time yet)
    
    const records = biometrics.map((b: any) => ({
      user_id: user.id,
      type: b.type,
      value: b.value,
      unit: b.unit,
      source: b.source,
      logged_at: new Date(b.timestamp),
    }));

    await prisma.biometricLog.createMany({
      data: records,
      skipDuplicates: false, // Prisma createMany doesn't support skipDuplicates on all DBs, but PostgreSQL does
    });

    return NextResponse.json({ success: true, count: records.length });
  } catch (error) {
    console.error('[API Biometrics Sync] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
