import { motion } from "framer-motion";

const PANELS = [
  {
    kicker: "The problem",
    title: ["Every college ", "claims", " to be the best."],
    body: "Brochures, coaching counsellors, random forum threads — everyone has an opinion and none of it lines up. You're left comparing apples to oranges with no clear answer.",
  },
  {
    kicker: "What we do",
    title: ["One table. ", "Fifteen factors.", " A real answer."],
    body: "We line every college up on the same yardstick — ranking, reputation, average & median package, placement rate, fees, research, infrastructure and more. The best value in each row glows green, the worst glows red. No spin.",
  },
  {
    kicker: "The payoff",
    title: ["You'll know ", "which one wins", " — and why."],
    body: "Every factor is scored and totalled, so you don't just see numbers — you get a ranked verdict and a clear winner. Then you decide with confidence.",
  },
];

function Panel({ panel }) {
  return (
    <div className="panel-wrap">
      <motion.div
        className="panel"
        initial={{ opacity: 0, y: 56, rotateX: 12 }}
        whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
        viewport={{ once: true, margin: "0px 0px -20% 0px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="kicker">{panel.kicker}</div>
        <h2>
          {panel.title[0]}
          <span className="grad">{panel.title[1]}</span>
          {panel.title[2]}
        </h2>
        <p>{panel.body}</p>
      </motion.div>
    </div>
  );
}

export default function ScrollStory() {
  return (
    <section className="story" id="how">
      {PANELS.map((p) => (
        <Panel key={p.kicker} panel={p} />
      ))}
    </section>
  );
}
