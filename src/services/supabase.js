import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wojnypvoftrurrvbezzd.supabase.co";

const supabaseKey = "sb_publishable_ieeWxOKfky0B7XDYCfdOtA_8CLdPsXt";

export const supabase = createClient(supabaseUrl, supabaseKey);
