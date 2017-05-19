def SLAVE_LABEL="cf_slave"

// uses a standard docker container to run the job
// Configures a private ssh key on the container(see sshagent wrapper). The public pair of the SSH key is stored in GitHub
// The private pair of the key is stored in Jenkins. The key has been generated for the functional ID Y9CTMV866@nomail.relay.ibm.com
// This gives the container access to github (shell script configures the github username and email)

node ("${SLAVE_LABEL}") {
	stage ('checkout scm') {
		checkout scm
	}
	stage ('trigger script to update release branch') {
		try {
				sshagent(['62a4e963-e7a4-4fc5-8530-0b1b9d72d789']) {
					sh 'scripts/create_release.sh'
				}
		} catch (err) {
			println "----ERROR: Failure when creating release branch"
			println "Jenkins Errror: ${err}"
			// sh 'scripts/post_to_slack.sh'
			currentBuild.result = 'FAILURE'
		}
	}
}
