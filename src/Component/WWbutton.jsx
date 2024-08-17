import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

function WWButton({
  text,
  variant = "v1",
  to = "#",
  minWidth = "8rem",
  display = "block",
  onClick,
}) {
  const baseClass =
    " text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";
  const commonClass = `text-white ${display}`;

  const variants = {
    v1: `bg-wwred hover:bg-red-600 focus-visible:outline-indigo-600 hidden min-w-[4rem] sm:block ${commonClass}`,
    v2: `bg-red-700 border border-red-300 hover:bg-red-800 text-slate-100 ${commonClass} `,
    v3: `bg-transparent text-white border border-wwred hover:bg-wwred min-w-[4rem] sm:min-w-[8rem] lg:min-w-[4rem] px-4 sm:py-2.5   ${commonClass}`,
    v4: `bg-black text-wwred border border-red-500 hover:bg-red-600 hover:text-white rounded-md px-3.5 py-2.5   ${commonClass}`,
  };

  return (
    <a to={"#"} className={variants === "v4" ? "inline-block m-1" : ""}>
      <button className={`${baseClass} ${variants[variant]}`} onClick={onClick}>
        {text}
      </button>
    </a>
  );
}

// WWButton.propTypes = {
//   text: PropTypes.string.isRequired,
//   variant: PropTypes.oneOf(["v1", "v2", "v3", "v4"]),
//   to: PropTypes.string,
//   minWidth: PropTypes.string,
//   display: PropTypes.string,
//   onClick: PropTypes.func,
// };

export default WWButton;
