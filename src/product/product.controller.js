import * as ServiceProduct from "./product.service.js";

export const getProductCartsService = async (req, res, next) => {
  try {
    const response = await ServiceProduct.getProductCartsService(req.body);
    res.status(200).send(response);
  } catch (error) {
    res.status(500).send({ error: "error" });
  }
}


export const AddProductController = async (req, res, next) => {
  try {
    const response = await ServiceProduct.addProductService(req.body);

    if (response.status === 200) {
      res.status(200).send(response);
    } else if (response.status === 400) {
      res.status(400).send({ error: response.message });
    } else {
      res.status(response.status).send({ error: response.message });
    }
  } catch (error) {
    res.status(500).send({ error: "Server error" });
  }
};

export const AddProductTypeController = async (req, res, next) => {
  try {
    // console.log(req);

    const response = await ServiceProduct.addProductTypeService(req.body);

    res.status(200).send(response);
  } catch (error) {
    res.status(500).send({ error: "error" });
  }
};

export const EditProductTypeController = async (req, res, next) => {
  try {
    // console.log(req);

    const response = await ServiceProduct.editProductService(req.body);

    res.status(200).send(response);
  } catch (error) {
    res.status(500).send({ error: "error" });
  }
};

export const GetProductController = async (req, res, next) => {
  try {
    // console.log(req);

    const response = await ServiceProduct.getProductService();
    res.status(200).send(response);
  } catch (error) {
    res.status(500).send({ error: "error" });
  }
};

export const GetProductByIdController = async (req, res, next) => {
  try {
    // console.log(req);

    const response = await ServiceProduct.getProductByIdService(req.body);
    res.status(200).send(response);
  } catch (error) {
    res.status(500).send({ error: "error" });
  }
};

export const GetProductTypeController = async (req, res, next) => {
  try {
    // console.log(req);

    const response = await ServiceProduct.getProductTypeService(req);
    res.status(200).send(response);
  } catch (error) {
    res.status(500).send({ error: "error" });
  }
};

export const UpdateProductController = async (req, res, next) => {
  try {
    // console.log(req);

    const response = await ServiceProduct.updateProductService(req.body);
    res.status(200).send(response);
  } catch (error) {
    res.status(500).send({ error: "error" });
  }
};
export const UpdateProductTypeController = async (req, res, next) => {
  try {
    // console.log(req);

    const response = await ServiceProduct.updateProductTypeService(req.body);
    res.status(200).send(response);
  } catch (error) {
    res.status(500).send({ error: "error" });
  }
};

export const DelectProductTypeController = async (req, res, next) => {
  try {
    // console.log(req);

    const response = await ServiceProduct.deleteProductTypeService(req.body);
    res.status(200).send(response);
  } catch (error) {
    res.status(500).send({ error: "error" });
  }
};

export const DelectProductController = async (req, res, next) => {
  try {
    // console.log(req);

    const response = await ServiceProduct.deleteProductService(req.body);
    res.status(200).send(response);
  } catch (error) {
    res.status(500).send({ error: "error" });
  }
};

export const GetProductByBarcodeController = async (req, res, next) => {
  try {
    const response = await ServiceProduct.getProductByBarCodeService(
      req.params
    );
    res.status(200).send(response);
  } catch (error) {
    res.status(500).send({ error: "error" });
  }
};

export const UpdateProductByBarcodeController = async (req, res, next) => {
  try {
    // console.log(req);

    const response = await ServiceProduct.updateProductByBarCodeService(
      req.body
    );
    res.status(200).send(response);
  } catch (error) {
    res.status(500).send({ error: "error" });
  }
};

export const GetProductTypeByIDController = async (req, res, next) => {
  try {
    const response = await ServiceProduct.getProductTypeByIDService(req.params);
    res.status(200).send(response);
  } catch (error) {
    res.status(500).send({ error: "error" });
  }
};

export const AddGropTypeProductController = async (req, res, next) => {
  try {
    // console.log(req);

    const response = await ServiceProduct.addGroupTypeProductService(req.body);

    res.status(200).send(response);
  } catch (error) {
    res.status(500).send({ error: "error" });
  }
};

export const GetGroupTypeProductController = async (req, res, next) => {
  try {
    const response = await ServiceProduct.getGroupTypeProductService();
    res.status(200).send(response);
  } catch (error) {
    res.status(500).send({ error: "error" });
  }
};

export const UpdateGroupProductTypeController = async (req, res, next) => {
  try {
    // console.log(req);

    const response = await ServiceProduct.updateGroupProductTypeService(
      req.body
    );

    res.status(200).send(response);
  } catch (error) {
    res.status(500).send({ error: "error" });
  }
};

export const GetProductSerialController = async (req, res, next) => {
  try {
    const response = await ServiceProduct.getProductSerialService(req.params);
    res.status(200).send(response);
  } catch (error) {
    res.status(500).send({ error: "error" });
  }
};

export const GetProductTypeAllController = async (req, res, next) => {
  try {
    // console.log(req);

    const response = await ServiceProduct.getProductTypeAllService(req);
    res.status(200).send(response);
  } catch (error) {
    res.status(500).send({ error: "error" });
  }
};

export const GetProductHaveSerialController = async (req, res, next) => {
  try {
    // console.log(req);

    const response = await ServiceProduct.getProductHaveSerialService(req);
    res.status(200).send(response);
  } catch (error) {
    res.status(500).send({ error: "error" });
  }
};
export const UpdateProductSerialController = async (req, res, next) => {
  try {
    // console.log(req);

    const response = await ServiceProduct.updateSerialService(req.body);
    res.status(200).send(response);
  } catch (error) {
    res.status(500).send({ error: "error" });
  }
};

export const checkproductCodeController = async (req, res, next) => {
  try {
    // console.log(req);

    const response = await ServiceProduct.checkproductCodeService(req.body);
    res.status(200).send(response[0]);
  } catch (error) {
    res.status(500).send({ error: "error" });
  }
};
