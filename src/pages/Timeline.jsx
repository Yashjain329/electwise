import { useState, useEffect, useRef } from 'react';
import { Chart } from 'react-google-charts';
import { Calendar, Clock, Flag } from 'lucide-react';

const nationalPhases = [
  ['Phase', 'Start', 'End'],
  ['Voter Registration', new Date(2026, 0, 1), new Date(2026, 1, 28)],
  ['Election Announcement', new Date(2026, 2, 1), new Date(2026, 2, 15)],
  ['Nomination Period', new Date(2026, 2, 16), new Date(2026, 2, 31)],
  ['Campaign Period', new Date(2026, 3, 1), new Date(2026, 3, 30)],
  ['Polling (Phase 1)', new Date(2026, 3, 19), new Date(2026, 3, 19)],
  ['Polling (Phase 7)', new Date(2026, 4, 1), new Date(2026, 4, 1)],
  ['Vote Counting & Results', new Date(2026, 5, 4), new Date(2026, 5, 5)],
];

const statePhases = [
  ['Phase', 'Start', 'End'],
  ['Voter Roll Update', new Date(2026, 6, 1), new Date(2026, 7, 15)],
  ['Election Schedule Announced', new Date(2026, 8, 1), new Date(2026, 8, 10)],
  ['Nomination Filing', new Date(2026, 8, 11), new Date(2026, 8, 25)],
  ['Scrutiny & Withdrawal', new Date(2026, 8, 26), new Date(2026, 8, 30)],
  ['Campaign Period', new Date(2026, 9, 1), new Date(2026, 9, 20)],
  ['Polling Day', new Date(2026, 9, 21), new Date(2026, 9, 21)],
  ['Counting & Declaration', new Date(2026, 9, 24), new Date(2026, 9, 24)],
];

const localPhases = [
  ['Phase', 'Start', 'End'],
  ['Ward Delimitation', new Date(2026, 1, 1), new Date(2026, 2, 15)],
  ['Voter List Revision', new Date(2026, 2, 16), new Date(2026, 3, 15)],
  ['Reservation of Seats', new Date(2026, 3, 16), new Date(2026, 3, 30)],
  ['Nomination Period', new Date(2026, 4, 1), new Date(2026, 4, 15)],
  ['Campaign Period', new Date(2026, 4, 16), new Date(2026, 5, 14)],
  ['Polling Day', new Date(2026, 5, 15), new Date(2026, 5, 15)],
  ['Counting & Results', new Date(2026, 5, 18), new Date(2026, 5, 18)],
];

const tabs = [
  { id: 'national', label: 'National (Lok Sabha)', data: nationalPhases },
  { id: 'state', label: 'State (Vidhan Sabha)', data: statePhases },
  { id: 'local', label: 'Local Body', data: localPhases },
];

const upcomingDates = [
  { icon: Calendar, title: 'Voter Registration Deadline', date: 'February 28, 2026', desc: 'Last date to register/update voter ID for next Lok Sabha elections.', color: '#1A3A6B' },
  { icon: Clock, title: 'SVEEP Campaign Period', date: 'March 15 – April 30, 2026', desc: 'Systematic Voters Education and Electoral Participation awareness drive.', color: '#924c00' },
  { icon: Flag, title: 'Results Declaration (Estimated)', date: 'June 2026', desc: 'Estimated dates for final counting and result declaration for the general assembly.', color: '#1a5c35' },
];

const chartOptions = {
  timeline: { colorByRowLabel: false, showRowLabels: true, singleColor: '#1A3A6B' },
  backgroundColor: 'transparent',
  colors: ['#002451', '#1A3A6B', '#fc8b19', '#924c00', '#1a5c35', '#6a1a6a', '#0d1b35'],
  fontName: 'Work Sans',
};

export default function Timeline() {
  const [activeTab, setActiveTab] = useState('national');
  const containerRef = useRef(null);
  const [chartWidth, setChartWidth] = useState(700);

  useEffect(() => {
    document.title = 'Election Timeline — ElectWise';
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setChartWidth(entry.contentRect.width);
      }
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const currentData = tabs.find(t => t.id === activeTab)?.data || nationalPhases;

  return (
    <main className="page-wrapper">
      {/* Header */}
      <section className="hero-gradient text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4">Election Timeline</h1>
          <p className="text-white/75 text-lg">Key dates, milestones, and phase-wise schedule for India's election cycles.</p>
        </div>
      </section>

      <section className="py-12 px-6 flex-1">
        <div className="max-w-5xl mx-auto">

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-8 bg-[#e9edff] p-1 rounded-xl w-fit">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === t.id ? 'bg-white text-[#002451] shadow-sm' : 'text-[#43474f] hover:text-[#002451]'
                }`}
                aria-pressed={activeTab === t.id}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Chart */}
          <div ref={containerRef} className="card p-4 mb-10 overflow-hidden">
            <h2 className="text-lg font-semibold font-serif text-[#0d1b35] mb-4 px-2">
              {tabs.find(t => t.id === activeTab)?.label} — 2026 Election Cycle
            </h2>
            <Chart
              chartType="Timeline"
              data={currentData}
              width={`${chartWidth - 32}px`}
              height="320px"
              options={chartOptions}
            />
          </div>

          {/* Upcoming Key Dates */}
          <div>
            <h2 className="text-2xl font-bold font-serif mb-6">Upcoming Key Dates</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {upcomingDates.map(d => (
                <div key={d.title} className="card p-6">
                  <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center" style={{ background: `${d.color}20` }}>
                    <d.icon size={20} color={d.color} />
                  </div>
                  <h3 className="font-semibold font-serif text-[#0d1b35] mb-1">{d.title}</h3>
                  <p className="text-[#fc8b19] text-sm font-semibold mb-2">{d.date}</p>
                  <p className="text-[#43474f] text-sm">{d.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="mt-8 p-4 bg-[#e9edff] rounded-xl text-sm text-[#43474f] border border-[#c4c6d0]">
            <strong>Note:</strong> All dates shown are approximate and based on ECI historical patterns. 
            Official schedules are announced by the Election Commission of India. Visit <strong>eci.gov.in</strong> for the latest official schedule.
          </div>
        </div>
      </section>
    </main>
  );
}
