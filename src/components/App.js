import React from 'react';
import {Button} from '@material-ui/core'

export default function App(props) {
    const {sources} = props;
    const {setSources} = props.AppActions;
    console.log(sources)
    const cloneButton = (source) => {
        return event => {
            setSources({sources: [...sources, source]})
        }
    }
    return (
        <div>
            {sources.map(source => (
                <Button 
                    variant="outlined" 
                    color="secondary"
                    onClick={cloneButton(source)}
                >{source}
                </Button>
            ))}
        </div>
    )
}
