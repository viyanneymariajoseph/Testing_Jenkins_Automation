pipeline {
    agent any

    stages {
        stage('Git-Checkout') {
            steps {
                echo "Checking out from Git Repo"
            }
        }

        stage('Build') {
            steps {
                echo "Building the checked-out project!"
            }
        }

        stage('Unit-Test') {
            steps {
                echo "Running JUnit Tests"
            }
        }

        stage('Quality-Gate') {
            steps {
                echo "Verifying Quality Gates"
            }
        }

        stage('Deploy') {
            steps {
                echo "Deploying to Stage Environment for more tests!"
                script {
                    // Run Deploy.bat and ignore harmless Robocopy exit codes
                    def result = bat(script: 'Deploy.bat', returnStatus: true)
                    if (result >= 8) {
                        error "Deployment failed (Robocopy exit code ${result})"
                    } else {
                        echo "Deployment succeeded (Robocopy exit code ${result})"
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'This will always run'
        }
        success {
            echo 'This will run only if successful'
        }
        failure {
            echo 'This will run only if failed'
        }
        unstable {
            echo 'This will run only if the run was marked as unstable'
        }
        changed {
            echo 'This will run only if the state of the Pipeline has changed'
            echo 'For example, if the Pipeline was previously failing but is now successful'
        }
    }
}
