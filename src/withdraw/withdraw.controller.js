import * as ServiceWithdraw from "./withdraw.service.js"


export const AddWithdrawController = async (req, res, next) => {
    try {
      // console.log(req);
  
      const response = await ServiceWithdraw.addWithdrawService(req.body);
      res.status(200).send(response);
    } catch (error) {
      res.status(500).send({ error: "error" });
    }
  };


  
export const GetWithdrawController = async (req, res, next) => {
    try {
      const response = await ServiceWithdraw.getWithdrawService(req.body);
      res.status(200).send(response);
    } catch (error) {
      res.status(500).send({ error: "error" });
    }
  };

    
export const GetWithdrawOrderIDController = async (req, res, next) => {
  try {
    const response = await ServiceWithdraw.getWithdrawByOrderService(req.body);
    res.status(200).send(response);
  } catch (error) {
    res.status(500).send({ error: "error" });
  }
};



    
export const ApproveWithdrawController = async (req, res, next) => {
  try {
    const response = await ServiceWithdraw.approveWithdrawService(req.body);
    res.status(200).send(response);
  } catch (error) {
    res.status(500).send({ error: "error" });
  }
};

export const UnapproveWithdrawController = async (req, res, next) => {
  try {
    const response = await ServiceWithdraw.unapproveWithdrawService(req.body);
    res.status(200).send(response);
  } catch (error) {
    res.status(500).send({ error: "error" });
  }
};

export const ApproveSomeItemWithdrawController = async (req, res, next) => {
  try {
    const response = await ServiceWithdraw.approveSomeItemWithdrawService(req.body);
    res.status(200).send(response);
  } catch (error) {
    res.status(500).send({ error: "error" });
  }
};

export const GetSerialProductController = async (req, res, next) => {
  try {
    const response = await ServiceWithdraw.getSerialProductService(req.body);
    res.status(200).send(response);
  } catch (error) {
    res.status(500).send({ error: "error" });
  }
};


export const AddWithdrawByBarcodeController = async (req, res, next) => {
  try {
    // console.log(req);

    const response = await ServiceWithdraw.withdrawByBarcodeService(req.body);
    res.status(200).send(response);
  } catch (error) {
    res.status(500).send({ error: "error" });
  }
}