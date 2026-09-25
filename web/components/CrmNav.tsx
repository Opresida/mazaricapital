'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITEMS = [
  { href: '/crm', label: 'Fila do dia' },
  { href: '/crm/leads', label: 'Leads' },
  { href: '/crm/agenda', label: 'Agenda' },
  { href: '/crm/mailings', label: 'Mailings' },
];

export default function CrmNav() {
  const pathname = usePathname();
  return (
    <div className="tabs" style={{ marginTop: -8 }}>
      {ITEMS.map((i) => {
        const active = pathname === i.href || (i.href !== '/crm' && pathname.startsWith(i.href));
        return (
          <Link key={i.href} href={i.href}>
            <button className={active ? 'active' : ''}>{i.label}</button>
          </Link>
        );
      })}
    </div>
  );
}
