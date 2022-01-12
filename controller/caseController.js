const CaseModel = require('../model/caseModel');
const APIFeatures = require('../utils/APIFeatures');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { WEIGHT_NUMBER, TYPE_CASE } = require('../utils/constants');

exports.getAllCase = catchAsync(async (req, res, next) => {
  const featuresBeforePaging = new APIFeatures(
    CaseModel.find(),
    req.query
  ).filter();

  const features = new APIFeatures(CaseModel.find(), req.query)
    .filter()
    .limitField()
    .sort()
    .pagination();

  const [caseBeforePaging, cases] = await Promise.all([
    featuresBeforePaging.query,
    features.query,
  ]);
  // const cases = await features.query;
  res.status(200).json({
    status: 'success',
    data: { length: caseBeforePaging.length, cases },
  });
});

exports.createCase = catchAsync(async (req, res, next) => {
  const newCases = await CaseModel.findOneAndUpdate(
    req.body,
    { expire: new Date() },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.status(200).json({
    status: 'success',
    data: {
      newCases,
    },
  });
});

exports.getCase = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const cases = await CaseModel.findById(id);

  if (!cases) return next(new AppError(`No case found with that ID!`, 404));

  res.status(200).json({
    status: 'success',
    data: {
      cases,
    },
  });
});

exports.updateCase = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const cases = await CaseModel.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!cases) return next(new AppError(`No case found with that ID!`, 404));

  res.status(200).json({
    status: 'success',
    data: {
      cases,
    },
  });
});

exports.deleteCase = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const cases = await CaseModel.findByIdAndDelete(id);
  if (!cases) return next(new AppError(`No case found with that ID!`, 404));

  res.status(200).json({
    status: 'success',
    data: {
      id,
    },
  });
});

exports.diagnosingCase = catchAsync(async (req, res, next) => {
  const { circuit, switchKey, stab, keycap, other } = req.body;
  req.params.type = 1;
  const features = new APIFeatures(CaseModel.find(), req.params).filter();

  const cases = await features.query;
  const resCase = {
    weightValue: 0,
    case: {},
  };
  const weightTotal = Object.values(WEIGHT_NUMBER).reduce(
    (pre, cur) => pre + cur,
    0
  );
  for (let i = 0; i < cases.length; i++) {
    const val = cases[i];
    const simCir = val.circuit === circuit.trim() ? 1 : 0;
    const simSw = val.switchKey === switchKey.trim() ? 1 : 0;
    const simStab = val.stab === stab.trim() ? 1 : 0;
    const simKeycap = val.keycap === keycap.trim() ? 1 : 0;
    const simOther = val.other === other.trim() ? 1 : 0;

    const similarityNum =
      (WEIGHT_NUMBER.CIRCUIT * simCir +
        WEIGHT_NUMBER.SWITCHKEY * simSw +
        WEIGHT_NUMBER.STAB * simStab +
        WEIGHT_NUMBER.KEYCAP * simKeycap +
        WEIGHT_NUMBER.OTHER * simOther) /
      weightTotal;

    if (similarityNum === 1) {
      resCase.weightValue = 1;
      resCase.case = val;
      break;
    }
    if (similarityNum > resCase.weightValue) {
      resCase.weightValue = similarityNum;
      resCase.case = val;
    }
  }
  if (resCase.weightValue < 1) {
    //Create new case
    await CaseModel.findOneAndUpdate(
      {
        circuit,
        switchKey,
        stab,
        keycap,
        other,
      },
      { expire: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      message: 'success',
      data: {
        type: TYPE_CASE.NEW,
        case: resCase.case,
      },
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      type: TYPE_CASE.DIAGNOSED,
      case: resCase.case,
    },
  });
});
