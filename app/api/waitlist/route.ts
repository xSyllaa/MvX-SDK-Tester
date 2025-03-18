import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SubscriptionPlanType } from '@/lib/subscription-plans';
import { supabaseAdmin } from '@/lib/supabase';

// Validation schema
const waitlistSchema = z.object({
  email: z.string().email().optional(),
  walletAddress: z.string().min(5).max(255).optional(),
  tier: z.enum([SubscriptionPlanType.PREMIUM, SubscriptionPlanType.ENTERPRISE]),
  notes: z.string().max(1000).optional(),
}).refine(data => data.email || data.walletAddress, {
  message: "Either email or wallet address must be provided",
  path: ["contact"]
});

type WaitlistRequest = z.infer<typeof waitlistSchema>;

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    
    // Validate the data
    const validationResult = waitlistSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Validation failed", 
          details: validationResult.error.format() 
        },
        { status: 400 }
      );
    }
    
    const data = validationResult.data;

    try {
      // Préparer la requête SQL à exécuter
      const sqlQuery = `
        SELECT add_to_waitlist(
          ${data.email ? `'${data.email}'` : 'NULL'},
          ${data.walletAddress ? `'${data.walletAddress}'` : 'NULL'},
          '${data.tier.toLowerCase()}',
          ${data.notes ? `'${data.notes}'` : 'NULL'}
        ) as waitlist_id
      `;
      
      // Exécuter la requête via la fonction RPC
      const { data: result, error } = await supabaseAdmin.rpc('execute_sql', { 
        sql_query: sqlQuery 
      });
      
      if (error) {
        console.error('Supabase RPC error:', error);
        return NextResponse.json(
          { 
            success: false, 
            error: 'Database operation failed', 
            details: error.message
          },
          { status: 500 }
        );
      }
      
      // Vérifier les résultats
      if (!result || !Array.isArray(result) || result.length === 0) {
        console.error('No result returned from database', result);
        return NextResponse.json(
          { success: false, error: 'No data returned from database' },
          { status: 500 }
        );
      }
      
      // Vérifier si une erreur est retournée dans le résultat
      if (result[0].error) {
        console.error('SQL execution error:', result[0]);
        return NextResponse.json(
          { 
            success: false, 
            error: result[0].error,
            details: result[0].detail
          },
          { status: 500 }
        );
      }
      
      const waitlistId = result[0]?.waitlist_id;
      
      if (!waitlistId) {
        console.error('No waitlist ID returned:', result);
        return NextResponse.json(
          { success: false, error: 'Failed to add to waitlist: no ID returned' },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: "Successfully added to waitlist",
        waitlistId
      });
    } catch (dbError) {
      console.error('Database operation error:', dbError);
      return NextResponse.json(
        { success: false, error: 'Database operation failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Waitlist error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process waitlist request' },
      { status: 500 }
    );
  }
} 