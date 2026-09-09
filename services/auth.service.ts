import { createClient } from "@/lib/supabase/client";
import type { AuthService } from "./contracts";
export const authService: AuthService = { async signInWithOtp(identifier){const supabase=createClient();if(!supabase)return;const isEmail=identifier.includes("@");if(isEmail)await supabase.auth.signInWithOtp({email:identifier});else await supabase.auth.signInWithOtp({phone:identifier})},async signInWithWechat(){/* MVP 阶段 mock，V2 接入真实微信 OAuth。 */},async signOut(){await createClient()?.auth.signOut()} };
