import DashboardLayout from '@/components/DashboardLayout';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  let username = '';

  if (token) {
    const payload = await verifyToken(token);
    if (payload && typeof payload.username === 'string') {
      username = payload.username;
    }
  }

  return <DashboardLayout username={username}>{children}</DashboardLayout>;
}
