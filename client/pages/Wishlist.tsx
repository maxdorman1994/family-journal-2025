import PlaceholderPage from "@/components/PlaceholderPage";

export default function Wishlist() {
  return (
    <PlaceholderPage
      title="Adventure Wishlist"
      description="Dream destinations and future adventures we're planning to explore across Scotland and beyond."
      suggestions={[
        "Interactive map of planned destinations",
        "Priority ranking and trip planning tools",
        "Budget estimates and saving progress",
        "Research notes and recommendations",
        "Seasonal planning and best times to visit",
        "Family votes on next adventures"
      ]}
    />
  );
}
