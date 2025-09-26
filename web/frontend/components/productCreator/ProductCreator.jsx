import { useState } from "react";
import { TextContainer, Text, LegacyCard, ProgressBar } from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";

export function ProductCreator() {

  const [progress, setProgress] = useState(null);

  const shopify = useAppBridge();
  const { t } = useTranslation();
  const productsCount = 500;

  const {
    data,
    refetch: refetchProductCount,
    isLoading: isLoadingCount,
  } = useQuery({
    queryKey: ["productCount"],
    queryFn: async () => {
      const response = await fetch("/api/products/count");
      return await response.json();
    },
    refetchOnWindowFocus: false,
  });

  const handlePopulate = async () => {
    // enqueue the job
    const response = await fetch("/api/products", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count: productsCount }),
    });

    if (!response.ok) {
      shopify.toast.show(t("ProductsCard.errorCreatingProductsToast"), { isError: true });
      return;
    }

    const { jobId } = await response.json();

    // open SSE connection
    const evtSource = new EventSource(`/api/products/jobs/${jobId}/stream`);

    evtSource.addEventListener("progress", (e) => {
      const { pct } = JSON.parse(e.data);
      setProgress(pct);
    });

    evtSource.onmessage = (e) => {
      console.log("Generic SSE message:", e.data);
    };

    evtSource.addEventListener("completed", async (e) => {
      evtSource.close();

      await refetchProductCount();
      shopify.toast.show(
        t("ProductsCard.productsCreatedToast", { count: productsCount })
      );
    });

    evtSource.addEventListener("failed", (e) => {
      evtSource.close();
      const { error } = JSON.parse(e.data);
      shopify.toast.show(
        t("ProductsCard.errorCreatingProductsToast"),
        { isError: true }
      );
      console.error("Job failed:", error);
    });
  };



  return (
    <div>
      {/* Progress bar */}
      <div className="progress-bar" style={{width: 225}}>
        <ProgressBar progress={progress} />
      </div>
    
    <LegacyCard
      title={t("ProductsCard.title")}
      sectioned
      primaryFooterAction={{
        content: t("ProductsCard.populateProductsButton", {
          count: productsCount,
        }),
        onAction: handlePopulate,
      }}
    >
      <TextContainer spacing="loose">
        <p>{t("ProductsCard.description")}</p>
        <Text as="h4" variant="headingMd">
          {t("ProductsCard.totalProductsHeading")}
          <Text variant="bodyMd" as="p" fontWeight="semibold">
            {isLoadingCount ? "-" : data?.count}
          </Text>
        </Text>
      </TextContainer>
    </LegacyCard>
    </div>
  );
}