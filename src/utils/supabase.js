
import { createClient } from '@supabase/supabase-js';


const VITE_SUPABASE_URL=`https://amyxdoptlefbgcwhzwjt.supabase.co`
const VITE_SUPABASE_ANON_KEY=`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFteXhkb3B0bGVmYmdjd2h6d2p0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0MDUzMzAsImV4cCI6MjA1Nzk4MTMzMH0.wxIoRdrhFFZZYJ8mDDhmvqAA5uid0wr18zy9p0rZVrQ`
        
const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

export default supabase
        