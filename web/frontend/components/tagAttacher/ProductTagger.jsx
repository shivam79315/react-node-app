import { useState } from "react";
import { LegacyCard, TextContainer, TextField, Button, ProgressBar, Text } from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useTranslation } from "react-i18next";

export function ProductTagger() {
  const shopify = useAppBridge();
  const { t } = useTranslation();
  const [tagsInput, setTagsInput] = useState("");
  const [progress, setProgress] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleTagAll = async () => {
    const tags = tagsInput.split(",").map(t => t.trim()).filter(Boolean);
    if (tags.length === 0) {
      shopify.toast.show("Please enter at least one tag", { isError: true });
      return;
    }

    setIsRunning(true);
    setProgress(0);

    const response = await fetch("/api/product-tags", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags }),
    });

    if (!response.ok) {
      shopify.toast.show("Failed to enqueue tags job", { isError: true });
      setIsRunning(false);
      return;
    }

    const { jobId } = await response.json();
    const evtSource = new EventSource(`/api/product-tags/jobs/${jobId}/stream`);

    evtSource.addEventListener("progress", (e) => {
      const { pct, processed, total } = JSON.parse(e.data);
      setProgress(pct);
      console.log(`Tagging Progress: ${pct}% (${processed}/${total})`);
    });

    evtSource.addEventListener("completed", (e) => {
      evtSource.close();
      setIsRunning(false);
      setProgress(null);
      shopify.toast.show("Tags added to all products!");
    });

    evtSource.addEventListener("failed", (e) => {
      evtSource.close();
      setIsRunning(false);
      setProgress(null);
      const { error } = JSON.parse(e.data);
      shopify.toast.show("Tagging job failed", { isError: true });
      console.error("Job failed:", error);
    });
  };

  return (
    <LegacyCard
      title="Bulk Product Tagger"
      sectioned
      primaryFooterAction={{
        content: "Add Tags to All Products",
        onAction: handleTagAll,
        loading: isRunning,
      }}
    >
      <TextContainer spacing="loose">
        <TextField
          label="Tags (comma separated)"
          value={tagsInput}
          onChange={setTagsInput}
          disabled={isRunning}
        />

        {progress !== null && (
          <div style={{ marginTop: "1rem" }}>
            <ProgressBar progress={progress} />
            <Text as="p" variant="bodyMd" alignment="center">
              {progress}%
            </Text>
          </div>
        )}
      </TextContainer>
    </LegacyCard>
  );
}