import { useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import { getDestinationImage } from "../../services/destinationImageService";

const fallback = "linear-gradient(135deg,#bfd9d0 0%,#e5e7d7 54%,#e8ccb1 100%)";

export default function DestinationCover({ destinationName, children, height = 190 }) {
  const [image, setImage] = useState(null);
  const [inView, setInView] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); observer.disconnect(); }
    }, { rootMargin: "180px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    let active = true;
    if (inView) getDestinationImage(destinationName).then((value) => { if (active) setImage(value); });
    return () => { active = false; };
  }, [destinationName, inView]);

  return <Box ref={ref} sx={{ height, position: "relative", overflow: "hidden", background: fallback }}>
    {image?.src && <Box component="img" src={image.src} alt={`${destinationName}, India`} loading="lazy" sx={{ width: "100%", height: "100%", display: "block", objectFit: "cover", transition: "transform .6s", "[data-destination-card]:hover &": { transform: "scale(1.045)" } }} />}
    <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(16,36,30,.12) 0%,transparent 44%,rgba(14,39,33,.36) 100%)" }} />
    <Box sx={{ position: "absolute", inset: 0, p: 2, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>{children}</Box>
    {image?.credit && <Box sx={{ position: "absolute", bottom: 3, right: 8, opacity: .76 }}><Typography component="a" href={image.creditUrl} target="_blank" rel="noreferrer" variant="caption" sx={{ color: "white", fontSize: ".6rem", textShadow: "0 1px 3px #1b3028", textDecoration: "none" }}>Photo: {image.credit}</Typography></Box>}
    {inView && !image && <Box sx={{ position: "absolute", bottom: 9, left: 12, display: "flex", alignItems: "center", gap: .5, color: "rgba(32,57,47,.55)" }}><ImageOutlinedIcon sx={{ fontSize: 15 }} /><Typography variant="caption" sx={{ fontSize: ".65rem" }}>Destination guide</Typography></Box>}
  </Box>;
}
