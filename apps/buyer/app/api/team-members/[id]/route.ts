// API Route for Individual Team Member Management
// Path: apps/buyer/app/api/team-members/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// PUT - Update team member
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { name, role, image_url, linkedin_url, github_url, twitter_url, display_order, is_active } = body;

        const { data, error } = await supabase
            .from('team_members')
            .update({
                name,
                role,
                image_url,
                linkedin_url,
                github_url,
                twitter_url,
                display_order,
                is_active
            })
            .eq('id', params.id)
            .select()
            .single();

        if (error) {
            console.error('Error updating team member:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data });
    } catch (error: any) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - Delete team member
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { error } = await supabase
            .from('team_members')
            .delete()
            .eq('id', params.id);

        if (error) {
            console.error('Error deleting team member:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
