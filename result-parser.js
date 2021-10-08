
class ResultParser {

    __parseTestResult(line) {
      let parts = line.split('|');
  
      let [
        _RecordType,
        _SequenceNb,
        sequenceId,
        measurementResult,
        unit,
        _ReferenceRange,
        flag,
        _NatureofAbnormality,
        _ResultStatus,
        _DateofChangeinNormativeValuesorUnits,
        _OperatorIdentification,
        _DateTimeTestStarting,
        _DateTimeTestCompleted,
        _InstrumentIdentification,
      ] = parts;
  
      let sampleId = sequenceId.split('^');
  
      sampleId = sampleId[sampleId.length - 1];
  
      unit = unit.replace(/\)/g, '');
  
      return {
        sampleId,
        measurementResult,
        unit,
       // flag
      }
    }
  
    __parseComments(line) {
      let parts = line.split('|');
  
      if (parts.length !== 5) return false;
  
      let [
        _RecordType,
        _ignored1,
        _ignored2,
        suspectedPathology,
        _ignored3,
      ] = parts;
  
      return suspectedPathology;
    }
  
    parse(transmissionString) {
      if (transmissionString.length < 10) {
        return [new Error('Transmission String Too Small')];
      }
  
      let testResultList = [];
      let suspectedPathologyList = [];
  
      let lineList = transmissionString.split('\n')
      for (let line of lineList) {
        if (line.length < 6) continue;
  
        let char;
        char = line[1];
 
        if ('01234567'.split('').indexOf(char) > -1) {
          line = line.substr(1, line.length);
        }
        char = line[1];
  
        if (char === 'Q') {
          let testResult = this.__parseTestResult(line);
          testResultList.push(testResult);
        }

        if (char === 'O') {
          let testResult = this.__parseTestResult(line);
          testResultList.push(testResult);
        }

        if (char === 'R') {
          let testResult = this.__parseTestResult(line);
          testResultList.push(testResult);
        }
  
        if (char === 'P') {
          let comments = this.__parseComments(line);
          if (comments) {
            suspectedPathologyList.push(comments);
          }
        }
  
      }
      return { testResultList, suspectedPathologyList };
  
    }
  
  }
  
  exports.ResultParser = ResultParser;