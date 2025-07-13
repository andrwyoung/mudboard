// this is the hook that detects when you're logged in
// and then initiates the user in our database if it's the first
// time logging in

import { useMetadataStore, UserProfile } from "@/store/metadata-store";
import { TablesInsert } from "@/types/supabase";
import { supabase } from "@/lib/supabase/supabase-client";
import { User } from "@supabase/supabase-js";
import { useEffect } from "react";
import { toast } from "sonner";
import { useUserPreferenceStore } from "@/store/use-preferences-store";

export function useUser() {
  const setUser = useMetadataStore((s) => s.setUser);
  const setProfile = useMetadataStore((s) => s.setProfile);
  const setUserPreferences = useUserPreferenceStore(
    (s) => s.bulkSetPreferences
  );
  const clearUserPreference = useUserPreferenceStore((s) => s.logout);

  const onLogin = async (user: User) => {
    // Check if profile exists
    const { data: existing, error: existingError } = await supabase
      .from("users")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (existingError) {
      console.error("Error checking for existing user:", existingError);
      return;
    }

    // if it doesn't exist in our tables, then
    // this is the first time a user is logging in
    // so we create a new profile for them
    if (!existing) {
      if (!user.email) {
        console.error("Error creating new profile. No email provided");
        return;
      }

      const newUserInsert: TablesInsert<"users"> = {
        user_id: user.id,
        email: user.email,
      };

      const { data: newProfile, error: insertError } = await supabase
        .from("users")
        .upsert(newUserInsert, { onConflict: "user_id" })
        .select()
        .single();
      if (insertError) {
        console.error("Error creating user profile:", insertError);
        return;
      }

      // if things go smoothly, then we run the welcome message
      if (newProfile) {
        setProfile(newProfile);
        // setUserPreferences(null); // just to be safe
      }
    } else {
      const existingProfile = existing as UserProfile;

      // this runs if an existing user is logging back in
      setProfile(existingProfile);
      setUserPreferences(existingProfile);
    }
  };

  useEffect(() => {
    const checkCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) onLogin(user); // if logged in then run the check
    };

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const user = session?.user ?? null;
        setUser(user);

        if (user) {
          if (event === "SIGNED_IN") onLogin(user);
          if (event === "INITIAL_SESSION") toast("Logged in!");
        } else {
          setProfile(null);
          clearUserPreference();

          // should only happen on log out
          if (event === "SIGNED_OUT") toast.success("Logged out successfully.");
        }
      }
    );

    checkCurrentUser();

    return () => listener.subscription.unsubscribe();
  }, [setUser, setProfile, setUserPreferences]);
}
