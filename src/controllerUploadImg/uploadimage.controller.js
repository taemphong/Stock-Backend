import * as ServiceUploadImg from "../controllerUploadImg/uploadimage.service.js";

export const uploadImageProduct = async (req, res, next) => {
  try {
    const response = await ServiceUploadImg.uploadImageProductService(req);

    if (response.status === 200) {
      return res.status(200).send(response);
    } else if (response.status === 400) {
      return res.status(400).send({ error: response.message });
    } else {
      return res.status(response.status).send({ error: response.message });
    }
  } catch (error) {
    console.error("Controller Error:", error);
    return res.status(500).send({ error: "Server error" });
  }
};




export  const getImageProductController = async (req, res) => {
  try {
    const response = await ServiceUploadImg.getImageProductService(req);

    if (response.status === 200) {
      return res.status(200).send(response);
    } else if (response.status === 400) {
      return res.status(400).send({ error: response.message });
    } else {
      return res.status(response.status).send({ error: response.message });
    }
  } catch (error) {
    console.error("Controller Error:", error);
    return res.status(500).send({ error: "Server error" });
  }
};
