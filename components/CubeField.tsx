// 12 cubes: position (top/left %), size (px), and starting rotation
const CUBES = [
  { top: '5%',  left: '8%',  size: 140,  rx: 15,  ry: 25,  rz: 5  },
  { top: '15%', left: '78%', size: 220, rx: -10, ry: 40,  rz: 15 },
  { top: '60%', left: '88%', size: 120,  rx: 30,  ry: -15, rz: -8 },
  { top: '75%', left: '12%', size: 180,  rx: -20, ry: 10,  rz: 20 },
  { top: '40%', left: '45%', size: 100,  rx: 10,  ry: -30, rz: 10 },
  { top: '85%', left: '60%', size: 150,  rx: -25, ry: 20,  rz: -12 },
  { top: '25%', left: '30%', size: 90,  rx: 20,  ry: 15,  rz: -5 },
  { top: '8%',  left: '55%', size: 130,  rx: -15, ry: -20, rz: 18 },
  { top: '50%', left: '5%',  size: 110,  rx: 25,  ry: -10, rz: -15 },
  { top: '65%', left: '35%', size: 80,  rx: -10, ry: 35,  rz: 8  },
  { top: '90%', left: '85%', size: 170,  rx: 15,  ry: -25, rz: -10 },
  { top: '32%', left: '92%', size: 100,  rx: -20, ry: 10,  rz: 25 },
] as const

export default function CubeField() {
  return (
    <div className="cube-field" aria-hidden="true">
      {CUBES.map((c, i) => (
        <div
          key={i}
          className="cube"
          style={{
            top: c.top,
            left: c.left,
            width: c.size,
            height: c.size,
            ['--s' as string]: `${c.size}px`,
            transform: `rotateX(${c.rx}deg) rotateY(${c.ry}deg) rotateZ(${c.rz}deg)`,
          }}
        >
          <div className="face front" />
          <div className="face back" />
          <div className="face right" />
          <div className="face left" />
          <div className="face top" />
          <div className="face bottom" />
        </div>
      ))}
    </div>
  )
}
