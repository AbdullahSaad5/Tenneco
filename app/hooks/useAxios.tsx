import axios, { AxiosInstance } from "axios";
import { useCallback, useRef, useEffect } from "react";
import { ComponentsData, ModelsData, ProductConfigIds } from "../_types";
import {
  ConfigurationResponse,
  MediaResponse,
  TechnologiesConfig,
  TechnologiesData,
  SetupConfig,
  SetupData,
  BenefitsConfig,
  BenefitsData,
} from "../_types/axios";

const instance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export const useAxios = () => {
  const abortControllersRef = useRef<Record<string, AbortController>>({});

  // Cleanup function to abort all pending requests
  useEffect(() => {
    const controllerRef = abortControllersRef.current;
    return () => {
      Object.values(controllerRef).forEach((controller) => {
        controller.abort();
      });
    };
  }, []);

  const createAbortController = (requestId: string): AbortController => {
    // Abort any existing request with the same ID
    if (abortControllersRef.current[requestId]) {
      abortControllersRef.current[requestId].abort();
    }

    const controller = new AbortController();
    abortControllersRef.current[requestId] = controller;
    return controller;
  };

  const getComponentsData = useCallback(async () => {
    const controller = createAbortController("getComponentsData");
    try {
      const response = await instance.get<ConfigurationResponse>("/configurations/67d76239afa60bac7a541055", {
        signal: controller.signal,
      });
      const responseData = response.data;
      const config = JSON.parse(responseData.config) as ComponentsData;

      const mainData = config.mainData;
      const overviewDialogsData = config.overviewDialogsData;
      return { mainData, overviewDialogsData };
    } finally {
      delete abortControllersRef.current["getComponentsData"];
    }
  }, []);

  const getModelsData = useCallback(async (): Promise<ModelsData> => {
    const controller = createAbortController("getModelsData");
    try {
      const response = await instance.get<ConfigurationResponse>("/configurations/67d75abfd092fb3c40304382", {
        signal: controller.signal,
      });
      const responseData = response.data;
      const config = JSON.parse(responseData.config) as { productConfigIds: ProductConfigIds };
      const productConfigIds = config.productConfigIds;

      // Create a new controller for media requests
      const mediaController = createAbortController("getModelsMediaData");

      // Fetch media data for each product config ID
      const mediaPromises = Object.entries(productConfigIds).map(async ([configName, configId]) => {
        const mediaResponse = await instance.get<MediaResponse>(`/media/${configId}`, {
          signal: mediaController.signal,
        });

        return {
          configName,
          media: mediaResponse.data,
        };
      });

      const mediaResults = await Promise.all(mediaPromises);

      // Create a map of configId to media data
      const mediaMap = mediaResults.reduce<Record<string, MediaResponse>>((acc, curr) => {
        acc[curr.configName] = curr.media;
        return acc;
      }, {});

      return {
        productConfigIds,
        mediaData: mediaMap,
      };
    } finally {
      delete abortControllersRef.current["getModelsData"];
      delete abortControllersRef.current["getModelsMediaData"];
    }
  }, []);

  const getTechnologiesData = useCallback(async (): Promise<TechnologiesData> => {
    const controller = createAbortController("getTechnologiesData");
    try {
      const response = await instance.get<ConfigurationResponse>("/configurations/67d75bb8d092fb3c40304406", {
        signal: controller.signal,
      });
      const responseData = response.data;

      const config = JSON.parse(responseData.config) as TechnologiesConfig;

      const productDialogData = config.productDialogData;

      const mediaController = createAbortController("getTechnologiesMediaData");

      const assetPromises = productDialogData.map(async (productDialog) => {
        const response = await instance.get<MediaResponse>(`/media/${productDialog.assetId}`, {
          signal: mediaController.signal,
        });
        return response.data;
      });

      const assetResults = await Promise.all(assetPromises);

      // Replace ids with media data
      const productDialogDataWithMedia = productDialogData.map((productDialog, index) => ({
        ...productDialog,
        media: assetResults[index],
      }));

      return { productDialogData: productDialogDataWithMedia };
    } finally {
      delete abortControllersRef.current["getTechnologiesData"];
      delete abortControllersRef.current["getTechnologiesMediaData"];
    }
  }, []);

  const getSetupData = useCallback(async (): Promise<SetupData> => {
    const controller = createAbortController("getSetupData");
    try {
      const response = await instance.get<ConfigurationResponse>("/configurations/67e0c704e5b2d4c45a53f04d", {
        signal: controller.signal,
      });

      const responseData = response.data;
      const config = JSON.parse(responseData.config) as SetupConfig;

      const { images, forwardVideos, backwardVideos } = config;

      const mediaController = createAbortController("getSetupMediaData");
      const imagePromises = images.map(async (image) => {
        const response = await instance.get<MediaResponse>(`/media/${image}`, {
          signal: mediaController.signal,
        });
        return response.data;
      });

      const forwardVideoPromises = forwardVideos.map(async (video) => {
        const response = await instance.get<MediaResponse>(`/media/${video}`, {
          signal: mediaController.signal,
        });
        return response.data;
      });

      const backwardVideoPromises = backwardVideos.map(async (video) => {
        const response = await instance.get<MediaResponse>(`/media/${video}`, {
          signal: mediaController.signal,
        });
        return response.data;
      });

      const [imageResults, forwardVideoResults, backwardVideoResults] = await Promise.all([
        Promise.all(imagePromises),
        Promise.all(forwardVideoPromises),
        Promise.all(backwardVideoPromises),
      ]);

      return {
        images: imageResults,
        forwardVideos: forwardVideoResults,
        backwardVideos: backwardVideoResults,
      };
    } finally {
      delete abortControllersRef.current["getSetupData"];
      delete abortControllersRef.current["getSetupMediaData"];
    }
  }, []);

  const getBenefitsData = useCallback(async (): Promise<BenefitsData> => {
    const controller = createAbortController("getBenefitsData");
    try {
      const response = await instance.get<ConfigurationResponse>("/configurations/67e0cee7e5b2d4c45a53f5ae", {
        signal: controller.signal,
      });
      const responseData = response.data;
      const config = JSON.parse(responseData.config) as BenefitsConfig;

      const { videos, reverseVideos, stillImages } = config;

      const mediaController = createAbortController("getBenefitsMediaData");

      const videoPromises = videos.map(async (video) => {
        const response = await instance.get<MediaResponse>(`/media/${video}`, {
          signal: mediaController.signal,
        });
        return response.data;
      });

      const reverseVideoPromises = reverseVideos.map(async (video) => {
        const response = await instance.get<MediaResponse>(`/media/${video}`, {
          signal: mediaController.signal,
        });
        return response.data;
      });

      const stillImagePromises = stillImages.map(async (image) => {
        const response = await instance.get<MediaResponse>(`/media/${image}`, {
          signal: mediaController.signal,
        });
        return response.data;
      });

      const [videoResults, reverseVideoResults, stillImageResults] = await Promise.all([
        Promise.all(videoPromises),
        Promise.all(reverseVideoPromises),
        Promise.all(stillImagePromises),
      ]);

      return {
        videos: videoResults,
        reverseVideos: reverseVideoResults,
        stillImages: stillImageResults,
      };
    } finally {
      delete abortControllersRef.current["getBenefitsData"];
      delete abortControllersRef.current["getBenefitsMediaData"];
    }
  }, []);

  const getAllMedias = useCallback(async (): Promise<MediaResponse[]> => {
    const controller = createAbortController("getAllMedias");
    try {
      const response = await instance.get<MediaResponse[]>("/media", {
        signal: controller.signal,
      });
      return response.data;
    } finally {
      delete abortControllersRef.current["getAllMedias"];
    }
  }, []);

  return { getComponentsData, getModelsData, getAllMedias, getTechnologiesData, getSetupData, getBenefitsData };
};

export default useAxios;
