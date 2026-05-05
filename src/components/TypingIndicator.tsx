import { motion } from "framer-motion";

const TypingIndicator = () => {
  const dotVariants = {
    hidden: { opacity: 0.4, y: 0 },
    visible: {
      opacity: 1,
      y: [0, -8, 0],
      transition: { duration: 0.6 },
    },
  };

  return (
    <div className="flex items-center gap-1 rounded-2xl rounded-bl-none bg-muted border border-border px-4 py-2.5 w-fit">
      <motion.div
        variants={dotVariants}
        initial="hidden"
        animate="visible"
        transition={{ repeat: Infinity, delay: 0 }}
        className="h-2 w-2 rounded-full bg-accent"
      />
      <motion.div
        variants={dotVariants}
        initial="hidden"
        animate="visible"
        transition={{ repeat: Infinity, delay: 0.2 }}
        className="h-2 w-2 rounded-full bg-accent"
      />
      <motion.div
        variants={dotVariants}
        initial="hidden"
        animate="visible"
        transition={{ repeat: Infinity, delay: 0.4 }}
        className="h-2 w-2 rounded-full bg-accent"
      />
    </div>
  );
};

export default TypingIndicator;
