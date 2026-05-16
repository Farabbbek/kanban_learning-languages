import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { display_name, username, bio, native_language, learning_languages } = body;

    const updates: Record<string, unknown> = {};

    if (display_name !== undefined) updates.display_name = display_name;
    if (username !== undefined) updates.username = username;
    if (bio !== undefined) updates.bio = bio;
    if (native_language !== undefined) updates.native_language = native_language;
    if (learning_languages !== undefined) updates.learning_languages = learning_languages;

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Profile update error:", error);

      if (error.message?.includes("idx_profiles_username") || error.code === "23505") {
        return NextResponse.json({ error: "Username already taken" }, { status: 409 });
      }

      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }

    return NextResponse.json({ profile: data });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use maybeSingle — profile may not exist yet
    // eslint-disable-next-line prefer-const
    let { data: profile, error: fetchError } = await supabase
      .from("profiles")

      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (fetchError) {
      console.error("Profile fetch error:", fetchError);
      return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }

    // If profile doesn't exist, auto-create one
    if (!profile) {
      const emailName = user.email?.split("@")[0] || "User";
      const { data: newProfile, error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          display_name: user.user_metadata?.full_name || emailName,
          username: user.user_metadata?.preferred_username || emailName,
          avatar_url: user.user_metadata?.avatar_url || "",
        })
        .select()
        .single();

      if (insertError) {
        console.error("Profile auto-create error:", insertError);
        return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
      }

      profile = newProfile;
    }


    return NextResponse.json({
      profile,
      email: user.email,
      created_at: user.created_at,
      account_id: user.id,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

