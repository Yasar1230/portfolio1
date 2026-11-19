interface ProjectSchematicProps {
  type: 'spherobot' | 'battery-thermal' | 'line-follower';
  title: string;
}

export function ProjectSchematic({ type, title }: ProjectSchematicProps) {
  return (
    <div className="relative w-full h-full min-h-[270px] sm:min-h-[340px] flex flex-col justify-between p-5 sm:p-7 drafting-grid-bg bg-[#EAECEF] dark:bg-[#14171D] text-[#0F1115] dark:text-[#F2F4F7]">
      <div className="flex items-center justify-between text-[11px] font-mono text-[#687182] dark:text-[#7E8797]">
        <span>Technical schematic placeholder</span>
        <span>Real photos pending</span>
      </div>

      <div className="flex-1 flex items-center justify-center py-4">
        {type === 'spherobot' && (
          <svg
            viewBox="0 0 420 260"
            className="w-full max-w-[380px] h-auto"
            role="img"
            aria-label={`Technical schematic placeholder for ${title}`}
          >
            {/* Outer spherical shell cross-section */}
            <circle cx="210" cy="130" r="98" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="210" cy="130" r="90" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.6" />
            {/* Equatorial flange */}
            <ellipse cx="210" cy="130" rx="98" ry="22" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.55" />
            {/* Transverse drive axle */}
            <line x1="94" y1="130" x2="326" y2="130" stroke="currentColor" strokeWidth="2.2" />
            <rect x="106" y="119" width="16" height="22" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4" />
            <rect x="298" y="119" width="16" height="22" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4" />
            {/* Central gimbal hub */}
            <rect x="188" y="114" width="44" height="32" rx="4" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="210" cy="130" r="7" fill="currentColor" />
            {/* Internal pendulum & counterweight */}
            <line x1="210" y1="130" x2="246" y2="196" stroke="currentColor" strokeWidth="3" />
            <circle cx="246" cy="196" r="19" fill="#E84C1E" />
            <circle cx="246" cy="196" r="19" fill="none" stroke="currentColor" strokeWidth="1.2" />
            {/* Swing arc annotation */}
            <path
              d="M 162 192 A 76 76 0 0 0 258 192"
              fill="none"
              stroke="#E84C1E"
              strokeWidth="1.3"
              strokeDasharray="3 3"
            />
            {/* Dimension ticks */}
            <line x1="210" y1="18" x2="210" y2="242" stroke="currentColor" strokeWidth="0.7" strokeDasharray="2 4" opacity="0.45" />
            <text x="334" y="134" className="fill-current font-mono text-[10px]" opacity="0.75">
              Axle
            </text>
            <text x="272" y="201" className="fill-[#E84C1E] font-mono text-[10px]">
              Pendulum mass
            </text>
          </svg>
        )}

        {type === 'battery-thermal' && (
          <svg
            viewBox="0 0 420 260"
            className="w-full max-w-[380px] h-auto"
            role="img"
            aria-label={`Technical schematic placeholder for ${title}`}
          >
            {/* Outer pack enclosure */}
            <rect x="64" y="42" width="232" height="176" rx="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
            {/* PCM absorption matrix fill */}
            <rect
              x="76"
              y="54"
              width="208"
              height="152"
              rx="4"
              fill="currentColor"
              fillOpacity="0.06"
              stroke="currentColor"
              strokeWidth="0.9"
              strokeDasharray="4 3"
            />
            {/* Cylindrical EV cell grid */}
            {[0, 1, 2, 3].map((col) =>
              [0, 1, 2].map((row) => {
                const cx = 112 + col * 46;
                const cy = 84 + row * 46;
                const isHot = col === 3 && row === 1;
                return (
                  <g key={`${col}-${row}`}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r="16"
                      fill={isHot ? '#E84C1E' : 'none'}
                      fillOpacity={isHot ? 0.22 : 0}
                      stroke={isHot ? '#E84C1E' : 'currentColor'}
                      strokeWidth={isHot ? '2' : '1.4'}
                    />
                    <circle
                      cx={cx}
                      cy={cy}
                      r="4"
                      fill={isHot ? '#E84C1E' : 'currentColor'}
                    />
                  </g>
                );
              }),
            )}
            {/* Temperature-triggered eject channel */}
            <line x1="296" y1="106" x2="364" y2="106" stroke="#E84C1E" strokeWidth="1.4" strokeDasharray="4 3" />
            <line x1="296" y1="154" x2="364" y2="154" stroke="#E84C1E" strokeWidth="1.4" strokeDasharray="4 3" />
            <path d="M 310 130 L 368 130 M 356 121 L 368 130 L 356 139" fill="none" stroke="#E84C1E" strokeWidth="2" />
            <text x="76" y="32" className="fill-current font-mono text-[10px]" opacity="0.75">
              PCM thermal jacket
            </text>
            <text x="304" y="96" className="fill-[#E84C1E] font-mono text-[10px]">
              Eject path
            </text>
          </svg>
        )}

        {type === 'line-follower' && (
          <svg
            viewBox="0 0 420 260"
            className="w-full max-w-[380px] h-auto"
            role="img"
            aria-label={`Technical schematic placeholder for ${title}`}
          >
            {/* Track reference curve */}
            <path
              d="M 40 220 C 120 220, 145 55, 210 55 C 275 55, 300 220, 380 220"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="5 5"
              opacity="0.35"
            />
            {/* Chassis plan view */}
            <path
              d="M 164 102 L 256 102 L 268 192 L 152 192 Z"
              fill="currentColor"
              fillOpacity="0.05"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            {/* Front curved analog sensor array bar */}
            <path
              d="M 140 82 Q 210 56 280 82"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
            />
            {[0, 1, 2, 3, 4, 5, 6].map((idx) => {
              const t = idx / 6;
              const x = 148 + t * 124;
              const y = 78 - Math.sin(t * Math.PI) * 14;
              return (
                <circle
                  key={idx}
                  cx={x}
                  cy={y}
                  r="3.2"
                  fill={idx === 3 ? '#E84C1E' : 'currentColor'}
                />
              );
            })}
            {/* Central downforce ducted fan */}
            <circle cx="210" cy="148" r="24" fill="none" stroke="#E84C1E" strokeWidth="1.8" />
            <circle cx="210" cy="148" r="7" fill="#E84C1E" />
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <line
                key={deg}
                x1="210"
                y1="148"
                x2={210 + Math.cos((deg * Math.PI) / 180) * 21}
                y2={148 + Math.sin((deg * Math.PI) / 180) * 21}
                stroke="#E84C1E"
                strokeWidth="1.2"
              />
            ))}
            {/* Dual rear BLDC motor wheels */}
            <rect x="132" y="156" width="16" height="40" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <rect x="272" y="156" width="16" height="40" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
            {/* Labels */}
            <text x="158" y="46" className="fill-current font-mono text-[10px]" opacity="0.75">
              Analog sensor array
            </text>
            <text x="296" y="179" className="fill-current font-mono text-[10px]" opacity="0.75">
              BLDC
            </text>
            <text x="174" y="216" className="fill-[#E84C1E] font-mono text-[10px]">
              Downforce fan · PID
            </text>
          </svg>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-[#687182] dark:text-[#7E8797]">
        <span>{title}</span>
        <span>Diagrammatic representation</span>
      </div>
    </div>
  );
}
