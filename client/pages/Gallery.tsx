import PlaceholderPage from "@/components/PlaceholderPage";

export default function Gallery() {
  return (
    <PlaceholderPage
      title="Photo Gallery"
      description="Browse through all our beautiful Scottish adventure photos organized by location, date, and tags."
      suggestions={[
        "Interactive photo grid with filtering options",
        "Photo albums organized by trip or location",
        "Lightbox view with photo details and stories",
        "Map view showing where photos were taken",
        "Download and sharing capabilities",
      ]}
    />
  );
}
