// Ícones SVG como componentes React
const Icons = {
  MapPin: (props) => React.createElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    width: props.size || 24,
    height: props.size || 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: props.className
  },
    React.createElement('path', { d: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' }),
    React.createElement('circle', { cx: '12', cy: '10', r: '3' })
  ),

  Calendar: (props) => React.createElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    width: props.size || 24,
    height: props.size || 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: props.className
  },
    React.createElement('rect', { x: '3', y: '4', width: '18', height: '18', rx: '2', ry: '2' }),
    React.createElement('line', { x1: '16', y1: '2', x2: '16', y2: '6' }),
    React.createElement('line', { x1: '8', y1: '2', x2: '8', y2: '6' }),
    React.createElement('line', { x1: '3', y1: '10', x2: '21', y2: '10' })
  ),

  Users: (props) => React.createElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    width: props.size || 24,
    height: props.size || 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: props.className
  },
    React.createElement('path', { d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }),
    React.createElement('circle', { cx: '9', cy: '7', r: '4' }),
    React.createElement('path', { d: 'M23 21v-2a4 4 0 0 0-3-3.87' }),
    React.createElement('path', { d: 'M16 3.13a4 4 0 0 1 0 7.75' })
  ),

  Plus: (props) => React.createElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    width: props.size || 24,
    height: props.size || 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: props.className
  },
    React.createElement('line', { x1: '12', y1: '5', x2: '12', y2: '19' }),
    React.createElement('line', { x1: '5', y1: '12', x2: '19', y2: '12' })
  ),

  Bell: (props) => React.createElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    width: props.size || 24,
    height: props.size || 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: props.className
  },
    React.createElement('path', { d: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9' }),
    React.createElement('path', { d: 'M13.73 21a2 2 0 0 1-3.46 0' })
  ),

  X: (props) => React.createElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    width: props.size || 24,
    height: props.size || 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: props.className
  },
    React.createElement('line', { x1: '18', y1: '6', x2: '6', y2: '18' }),
    React.createElement('line', { x1: '6', y1: '6', x2: '18', y2: '18' })
  ),

  Search: (props) => React.createElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    width: props.size || 24,
    height: props.size || 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: props.className
  },
    React.createElement('circle', { cx: '11', cy: '11', r: '8' }),
    React.createElement('line', { x1: '21', y1: '21', x2: '16.65', y2: '16.65' })
  ),

  Gift: (props) => React.createElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    width: props.size || 24,
    height: props.size || 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: props.className
  },
    React.createElement('polyline', { points: '20 12 20 22 4 22 4 12' }),
    React.createElement('rect', { x: '2', y: '7', width: '20', height: '5' }),
    React.createElement('line', { x1: '12', y1: '22', x2: '12', y2: '7' }),
    React.createElement('path', { d: 'M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z' }),
    React.createElement('path', { d: 'M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z' })
  ),

  Cake: (props) => React.createElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    width: props.size || 24,
    height: props.size || 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: props.className
  },
    React.createElement('path', { d: 'M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8' }),
    React.createElement('path', { d: 'M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1' }),
    React.createElement('path', { d: 'M2 21h20' }),
    React.createElement('path', { d: 'M7 8v3' }),
    React.createElement('path', { d: 'M12 8v3' }),
    React.createElement('path', { d: 'M17 8v3' }),
    React.createElement('path', { d: 'M7 4h.01' }),
    React.createElement('path', { d: 'M12 4h.01' }),
    React.createElement('
