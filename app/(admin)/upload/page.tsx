import UploadAnalyzer from "./UploadAnalyzer";

export default function UploadPage() {
  return (
    <div className="max-w-3xl animate-fade-in">
      <h1 className="text-2xl text-text-primary mb-2">Add New Item</h1>
      <p className="text-sm text-text-secondary mb-6">
        Upload a photo and let AI analyze it, then review and save to inventory.
      </p>
      <UploadAnalyzer />
    </div>
  );
}
