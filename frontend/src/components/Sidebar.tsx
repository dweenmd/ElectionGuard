"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useUI, useTranslation } from '@/context/UIContext';

export default function Sidebar({ role: propRole }: { role?: "voter" | "candidate" | "admin" }) {
  const pathname = usePathname();
  const { role: authRole } = useAuth();
  const { isMobileMenuOpen, closeMobileMenu } = useUI();
  const { t } = useTranslation();
  
  const role = propRole || authRole || "voter";

  const voterLinks = [
    { name: t('common.dashboard'), icon: 'dashboard', path: '/voter' },
    { name: t('common.feed'), icon: 'newspaper', path: '/feed' },
    { name: t('common.vote'), icon: 'how_to_vote', path: '/vote' },
    { name: t('common.grievance'), icon: 'report', path: '/grievance' },
    { name: t('common.compare'), icon: 'compare_arrows', path: '/compare' },
    { name: t('common.pollingCenter'), icon: 'location_on', path: '/polling-centers' },
    { name: t('common.voterSlip'), icon: 'qr_code_2', path: '/voter/slip' },
    { name: t('common.uploadDocs'), icon: 'upload_file', path: '/voter/upload' },
    { name: t('common.profile'), icon: 'person', path: '/profile' },
    { name: t('common.help'), icon: 'help', path: '/help' },
  ];

  const candidateLinks = [
    { name: t('common.dashboard'), icon: 'dashboard', path: '/candidate' },
    { name: t('common.feed'), icon: 'newspaper', path: '/feed' },
    { name: t('common.uploadDocs'), icon: 'upload_file', path: '/candidate/upload' },
    { name: t('common.campaign'), icon: 'campaign', path: '/candidate/campaign' },
    { name: t('common.vote'), icon: 'how_to_vote', path: '/vote' },
    { name: t('common.compare'), icon: 'compare_arrows', path: '/compare' },
    { name: t('common.pollingCenter'), icon: 'location_on', path: '/polling-centers' },
    { name: t('common.profile'), icon: 'person', path: '/profile' },
    { name: t('common.help'), icon: 'help', path: '/help' },
  ];

  const adminLinks = [
    { name: t('common.dashboard'), icon: 'dashboard', path: '/admin' },
    { name: t('common.electionControl'), icon: 'how_to_vote', path: '/admin/election-control' },
    { name: t('common.feed'), icon: 'newspaper', path: '/feed' },
    { name: t('common.candidates'), icon: 'group', path: '/admin/candidates' },
    { name: t('common.grievance'), icon: 'report', path: '/admin/grievances' },
    { name: t('common.results'), icon: 'bar_chart', path: '/admin/results' },
    { name: t('common.analytics'), icon: 'monitoring', path: '/admin/analytics' },
    { name: t('common.auditLog'), icon: 'history', path: '/admin/audit-log' },
    { name: t('common.help'), icon: 'help', path: '/help' },
  ];

  const links = role === "admin" ? adminLinks : role === "candidate" ? candidateLinks : voterLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-scrim/50 backdrop-blur-sm z-20 md:hidden" 
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <nav className={`
        flex flex-col h-full p-4 bg-surface-container shadow-md w-64 fixed left-0 top-0 z-30 border-r border-outline-variant/30
        transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="mb-8 pl-2 flex justify-between items-start">
          <div>
            <Link href="/" onClick={closeMobileMenu} className="flex items-center gap-2 text-primary mb-2 hover:opacity-80 transition-opacity">
              <span className="material-symbols-outlined text-2xl">how_to_vote</span>
              <span className="text-headline-md font-bold tracking-tight">ElectionGuard</span>
            </Link>
            <p className="text-caption text-on-surface-variant mt-2 capitalize">
              {role} Portal
            </p>
            <p className="text-caption text-success mt-1 flex items-center bg-success/10 w-max px-2 py-1 rounded-full border border-success/20">
              <span className="material-symbols-outlined text-[14px] mr-1" data-weight="fill">lock</span>
              {t('common.secureSession')}
            </p>
          </div>
          <button onClick={closeMobileMenu} className="md:hidden text-on-surface-variant hover:text-primary">
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>
      
      <ul className="flex flex-col gap-2 flex-grow relative">
        {links.map((link) => {
          const isActive = pathname === link.path;
          return (
            <li key={link.name}>
              <Link 
                href={link.path}
                onClick={closeMobileMenu}
                className={`flex items-center p-3 rounded-lg transition-all relative overflow-hidden group ${
                  isActive 
                    ? 'bg-primary text-on-primary font-bold shadow-md' 
                    : 'text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-primary-fixed-dim rounded-r-full"></span>
                )}
                <span className="material-symbols-outlined mr-3 transition-transform group-hover:scale-110">{link.icon}</span>
                <span className="text-body-md relative z-10">{link.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      
      <div className="mt-auto pt-4 border-t border-outline-variant/50">
        <button className="w-full flex items-center justify-center p-3 border-2 border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors mb-2">
          <span className="material-symbols-outlined mr-2 text-sm">help</span>
          <span className="text-label-md font-bold">{t('common.needHelp')}</span>
        </button>
      </div>
    </nav>
    </>
  );
}
