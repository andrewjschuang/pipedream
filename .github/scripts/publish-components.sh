#!/bin/bash

UNPUBLISHED=""
PUBLISHED=""
ERRORS=""
SKIPPED=""
mapfile -d ',' -t added_modified_renamed_files < <(printf '%s,%s' '${{ steps.files.outputs.added_modified }}' '${{ steps.files.outputs.renamed }}')
for added_modified_file in "${added_modified_renamed_files[@]}"; do
# starts with components, ends with .*js (e.g. .js and .mjs) and not app.js,
# doesn't end with /common*.*js, and doesn't follow */common/
if [[ $added_modified_file == components/* ]] && [[ $added_modified_file == *.*js ]] && [[ $added_modified_file != *.app.*js ]] \
    && [[ $added_modified_file != */common*.*js ]] && [[ $added_modified_file != */common/* ]]
then
    echo "attempting to publish ${added_modified_file}"
    PD_OUTPUT=`./pd publish ${added_modified_file} --json`
    if [ $? -eq 0 ]
    then
    KEY=`echo $PD_OUTPUT | jq -r ".key"`
    echo "published ${KEY}"
    echo "${KEY} will be added to the registry"
    curl "https://api.pipedream.com/graphql" -H "Content-Type: application/json" -H "Authorization: Bearer ${PD_API_KEY}" --data-binary $'{"query":"mutation($key: String!, $registry: Boolean!, $gitPath: String){\\n  setComponentRegistry(key: $key, registry: $registry, gitPath: $gitPath){\\n    savedComponent{\\n      id\\n      key\\n      gitPath\\n    }\\n  }\\n}","variables":{"key":"'${KEY}'","registry":'true',"gitPath":"'${added_modified_file}'"}}'
    PUBLISHED+="*${added_modified_file}"
    else
    ERROR=`echo $PD_OUTPUT | jq -r ".error"`
    ERROR_MESSAGE="${ERROR} with ${added_modified_file}"
    echo $ERROR_MESSAGE
    ERRORS+="*${ERROR_MESSAGE}"
    UNPUBLISHED+="*${added_modified_file}"
    # add to array to spit out later
    fi
else
    echo "${added_modified_file} will not be added to the registry"
    SKIPPED+="*${added_modified_file}"
fi
done
# print out everything that didn't publish
if [ ${#UNPUBLISHED[@]} -ne 0 ]; then
echo "the following files were not published"
printf '%s\n' "${UNPUBLISHED[@]}"
fi
# curl with form
curl -X POST -d "skipped=${SKIPPED}" -d "errors=${ERRORS}" -d "unpublished=${UNPUBLISHED}" -d "published=${PUBLISHED}" $ENDPOINT
