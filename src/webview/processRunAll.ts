import { Problem } from '../types';
import { runSingleAndSave } from './processRunSingle';
import { compileFile, getBinSaveLocation } from '../compiler';
import { deleteBinary } from '../executions';
import { getLanguage } from '../utils';
import { getJudgeViewProvider } from '../extension';
import { getDeleteAfterRunPref } from '../preferences';

/**
 * Run every testcase in a problem one by one. Waits for the first to complete
 * before running next. `runSingleAndSave` takes care of saving.
 **/
export default async (problem: Problem, skipCompile = false) => {
    console.log('Run all started', problem);
    const didCompile = skipCompile || (await compileFile(problem.srcPath));
    if (!didCompile) {
        return;
    }
    const PromiseList: Promise<void>[] = [];
    for (const testCase of problem.tests) {
        getJudgeViewProvider().extensionToJudgeViewMessage({
            command: 'running',
            id: testCase.id,
            problem: problem,
        });
        // await runSingleAndSave(problem, testCase.id, true);
        PromiseList.push(runSingleAndSave(problem, testCase.id, true));
    }
    await Promise.all(PromiseList);
    console.log('Run all finished');
    if (getDeleteAfterRunPref())
        deleteBinary(
            getLanguage(problem.srcPath),
            getBinSaveLocation(problem.srcPath),
        );
};
